import logging
import configparser
from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand

from .server import Server

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "run mqtt-bridge server"

    def handle(self, *args, **options):
        channel_layer = get_channel_layer()
        config = configparser.ConfigParser()
        config.read(options['config'])

        mqtt_channel_name = options['channel_name'] or "mqtt"
        mqtt_channel_pub = options['channel_sub'] or "mqtt.pub"
        mqtt_channel_sub = options['channel_pub'] or "mqtt.sub"

        logger.info((
            "Starting interface to MQTT broker %s:%s, "
            "MQTT channel name: %s, "
            "MQTT SUB: %s, "
            "MQTT PUB: %s"),
            config['broker']['host'],
            config['broker']['port'],
            mqtt_channel_name,
            mqtt_channel_sub,
            mqtt_channel_pub,
        )

        server = Server(
            channel_layer,
            mqtt_channel_name,
            mqtt_channel_sub,
            mqtt_channel_pub,
            config
        )

        server.run()

    def add_arguments(self, parser):
        parser.add_argument("-f", "--config", help="configuration file")

        parser.add_argument(
            "-n", "--channel-name",
            help="Name of Channels's channel to send and receive messages"
        )

        parser.add_argument(
            "-s", "--channel-sub",
            help=(
                "Name of Channels's channel for MQTT Sub messages, "
                "default is mqtt.pub"
            )
        )

        parser.add_argument(
            "-x", "--channel-pub",
            help=(
                "Name of Channels's channel for MQTT Pub messages, "
                "default is mqtt.sub"
            )
        )
