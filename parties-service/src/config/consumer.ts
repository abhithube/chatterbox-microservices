import kafka from './kafka';

const consumer = kafka.consumer({ groupId: 'consumer-group' });

export default consumer;
