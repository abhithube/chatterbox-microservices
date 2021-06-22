import kafka from './kafka';

const consumer = kafka.consumer({ groupId: 'messages-consumer' });

export default consumer;
