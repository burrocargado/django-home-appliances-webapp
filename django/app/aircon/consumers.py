from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import logging
from .models import Status

GROUP = 'aircon'

logger = logging.getLogger(__name__)


class Consumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.channel_layer.group_add(GROUP, self.channel_name)

        await self.accept()

        # At the begining of the connection,
        # pickup latest status and sensor data from the database,
        # send them to the browser via WebSocket.
        try:
            for data in await self.get_acstatus():
                data_json = {
                    'message': data,
                }
                await self.send(text_data=json.dumps(data_json))
        except Exception:
            pass

    async def disconnect(self, code):
        await self.channel_layer.group_discard(GROUP, self.channel_name)

    # Receive data from the browser via WebSocket.
    async def receive(self, text_data=None, bytes_data=None):
        logger.debug('text_data: %s, bytes_data: %s', text_data, bytes_data)
        data = {
            'topic': 'aircon/control',
            'payload': text_data,
        }
        await self.channel_layer.send("mqtt.pub", {
            "type": "mqtt.pub",
            "text": data,
        })

    # Receive data from the 'aricon' group of channel layer.
    async def receive_mqtt(self, data):
        data_json = {
            'message': data['message'],
        }
        # Send data to the browser via WebSocket
        await self.send(text_data=json.dumps(data_json))

    @database_sync_to_async
    def get_acstatus(self):
        # pylint: disable=no-member
        data = [
            {item.datatype: json.loads(item.data)}
            for item in Status.objects.filter(retain=True).order_by('time')
        ]
        item = Status.objects.get(datatype='status')
        data.append(
            {item.datatype: json.loads(item.data)}
        )
        item = Status.objects.get(datatype='update')
        data.append(
            {item.datatype: json.loads(item.data)}
        )
        logger.debug(data)
        return data
