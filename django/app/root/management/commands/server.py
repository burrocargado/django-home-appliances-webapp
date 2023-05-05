# Copyright (C) 2022, 2023 BurroCargado
# based on code by xavierlesa copyright (C) 2018, 2019
# channels-asgi-mqtt chasgimqtt/server.py
# https://github.com/xavierlesa/channels-asgi-mqtt
# commit 3fe74d92991704f9aeb58f0bae9fcd447627f715
# License: https://www.gnu.org/licenses/gpl-3.0.en.html GPL Version 3

import os
import asyncio
import functools
import logging
import time
import signal
import json
import ssl

import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)


class Server:
    """
    Bridge between MQTT broker and Django Channel
    """
    def __init__(self, channel, mqtt_channel_name,
                 mqtt_channel_sub, mqtt_channel_pub, config):

        self.channel = channel
        self.config = config
        client_id = self.config['credentials'].get('client_id')
        self.client = mqtt.Client(client_id=client_id)
        self.stop = False
        self.loop = None
        self.client.on_connect = self._mqtt_on_connect
        self.client.on_disconnect = self._mqtt_on_disconnect
        self.client.on_message = self._mqtt_on_message

        topics = []
        topics_str = config['broker'].get('topics')
        if topics_str:
            for t in topics_str.split():
                topic, qos = t.split(':')
                topics.append((topic, int(qos)))
        self.topics_subscription = topics or [("#", 2), ]

        self.mqtt_channel_name = mqtt_channel_name
        self.mqtt_channel_pub = mqtt_channel_pub
        self.mqtt_channel_sub = mqtt_channel_sub

    def _mqtt_on_connect(self, client, _userdata, _flags, rc):
        logger.info("Connected with status %s", rc)
        logger.info(
            "Subscribing to %s",
            ", ".join([f"{t} qos:{q}" for t, q in self.topics_subscription])
        )
        client.subscribe(self.topics_subscription, qos=1)

    def _mqtt_on_disconnect(self, client, _userdata, _rc):
        logger.info("Disconnected")
        if not self.stop:
            while True:
                logger.info("Trying to reconnect")
                try:
                    client.reconnect()
                    logger.info("Reconnected")
                    break
                except Exception as e:
                    logger.debug(e)
                    time.sleep(5)

    async def _channel_send(self, future, channel_layer, channel, event):
        result = await channel_layer.send(channel, event)
        future.set_result(result)

    def _channel_send_got_result(self, future):
        logger.debug("Sending message to MQTT channel.")
        result = future.result()
        if result:
            logger.debug("Result: %s", result)

    def _mqtt_on_message(self, _client, _userdata, message):
        logger.debug("Received from mqtt, topic: %s", message.topic)
        payload = message.payload

        try:
            payload = json.loads(payload)
        except Exception as e:
            logger.debug("Payload is not in JSON format: %s", e)

        logger.debug("Payload: %s", payload)

        # Compose a message for Channel with raw data received from MQTT
        msg = {
            "topic": message.topic,
            "payload": payload,
            "qos": message.qos,
            "retain": message.retain,
        }

        try:
            # create a coroutine and send
            future = asyncio.Future()
            asyncio.ensure_future(
                self._channel_send(
                    future,
                    self.channel,
                    self.mqtt_channel_name,
                    {
                        "type": self.mqtt_channel_sub,
                        "text": msg
                    })
            )

            # attach callback for logs only
            future.add_done_callback(self._channel_send_got_result)

        except Exception:
            logger.exception("Cannot send message %s", msg)

    async def mqtt_loop(self):
        """
        This is the loop for receiving MQTT messages
        """
        username = self.config['credentials'].get('username')
        password = self.config['credentials'].get('password')
        if username is not None and password is not None:
            self.client.username_pw_set(username, password)
        use_tls = self.config['broker'].getboolean('tls', fallback=False)
        if use_tls:
            logger.info('Use TLS for MQTT connection')
            ca_cert = self.config['credentials'].get('cacert')
            certfile = self.config['credentials'].get('certfile')
            keyfile = self.config['credentials'].get('keyfile')
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            if ca_cert is not None:
                context.load_verify_locations(ca_cert)
            else:
                logger.warning('Insecure mode: disable TLS server check')
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
            if certfile is not None and keyfile is not None:
                context.load_cert_chain(certfile, keyfile)

            self.client.tls_set_context(context)

        host = self.config['broker']['host']
        port = self.config['broker'].getint('port')
        self.client.connect(host, port)

        logger.info("Starting mqtt loop")

        while True:
            self.client.loop(0.1)
            await asyncio.sleep(0.1)

    def _channel_receive(self, msg):
        """
        Receive a message from Channel `mqtt.pub` and send it to MQTT broker
        """
        logger.info("Receive from channel: %s", msg)
        # We only listen for messages from mqtt_channel_pub
        if msg['type'] == self.mqtt_channel_pub:

            payload = msg['text']

            if not isinstance(payload, dict):
                payload = json.loads(payload)

            self.client.publish(
                payload['topic'],
                payload['payload'],
                qos=payload.get('qos', 2),
                retain=False)

    async def channel_loop(self):
        """
        This is the loop for receiving channel messages
        """
        logger.info("Starting channel loop")

        while True:
            try:
                logger.debug(
                    "Wait for a message from channel %s",
                    self.mqtt_channel_pub
                )
                self._channel_receive(
                    await self.channel.receive(self.mqtt_channel_pub)
                )
            except Exception:
                logger.exception('channel_loop Exception')
                await asyncio.sleep(5.0)

    def stop_server(self, signum):
        logger.info("Received signal %s, terminating", signum)
        self.stop = True
        for task in asyncio.all_tasks():
            task.cancel()
        self.loop.stop()

    def run(self):
        self.stop = False
        loop = asyncio.get_event_loop()
        self.loop = loop

        for signame in ('SIGINT', 'SIGTERM'):
            loop.add_signal_handler(
                getattr(signal, signame),
                functools.partial(self.stop_server, signame)
            )

        logger.info("Event loop running forever, press Ctrl+C to interrupt.")
        logger.info("pid %s: send SIGINT or SIGTERM to exit.", os.getpid())

        tasks = set()
        tasks.add(asyncio.ensure_future(self.mqtt_loop()))
        tasks.add(asyncio.ensure_future(self.channel_loop()))

        try:
            loop.run_forever()
        finally:
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()

        self.client.disconnect()
