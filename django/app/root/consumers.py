import json
import logging
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from aircon.models import Status as ACStatus
from django.utils import timezone

ACGROUP = 'aircon'

logger = logging.getLogger(__name__)


class MqttConsumer(AsyncConsumer):

    async def mqtt_sub(self, event):
        topic = event['text']['topic']
        payload = event['text']['payload']
        retain = True if event['text']['retain'] == 1 else False
        if topic == 'aircon/status':
            logger.info('topic: %s payload: %s retain: %s', topic, payload, retain)
            payload_data = {'status': payload}
            await self.save_ac_status(payload)
        elif topic == 'aircon/update':
            logger.info('topic: %s payload: %s retain: %s', topic, payload, retain)
            payload_data = {'update': payload}
            await self.save_ac_update(payload)
        elif topic == 'aircon/client/bridge':
            logger.debug('topic: %s payload: %s retain: %s', topic, payload, retain)
            payload_data = {'bridge': payload}
            await self.save_ac_bridge(payload, True)
        elif topic == 'aircon/client/processor':
            logger.debug('topic: %s payload: %s retain: %s', topic, payload, retain)
            db_retain = True if 'state' in payload else False
            payload_data = {'processor': payload}
            await self.save_ac_processor(payload, db_retain)
        else:
            logger.debug('topic: %s payload: %s retain: %s', topic, payload, retain)
            return
        channel_data = {
            'type': 'receive_mqtt',
            'message': payload_data,
        }
        await self.channel_layer.group_send(ACGROUP, channel_data)

    @database_sync_to_async
    def save_ac_status(self, data):
        # pylint: disable=no-member
        _status, _created = ACStatus.objects.update_or_create(
            datatype='status',
            defaults={
                'data': json.dumps(data),
                'time': timezone.now,
            },
        )

    @database_sync_to_async
    def save_ac_update(self, data):
        # pylint: disable=no-member
        _status, _created = ACStatus.objects.update_or_create(
            datatype='update',
            defaults={
                'data': json.dumps(data),
                'time': timezone.now,
            },
        )

    @database_sync_to_async
    def save_ac_bridge(self, data, retain):
        # pylint: disable=no-member
        _status, _created = ACStatus.objects.update_or_create(
            datatype='bridge',
            retain=retain,
            defaults={
                'data': json.dumps(data),
                'time': timezone.now,
            },
        )

    @database_sync_to_async
    def save_ac_processor(self, data, retain):
        # pylint: disable=no-member
        _status, _created = ACStatus.objects.update_or_create(
            datatype='processor',
            retain=retain,
            defaults={
                'data': json.dumps(data),
                'time': timezone.now,
            },
        )
