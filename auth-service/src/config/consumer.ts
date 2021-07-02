import kafka from './kafka';

const consumer = kafka.consumer({ groupId: 'auth-consumer' });

export default consumer;
