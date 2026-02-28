/**
 * Kafka Mock
 *
 * Mock for packages/utils/kafka which exports `kafka`.
 */
import { vi } from 'vitest';

export const kafkaProducerMock = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  send: vi.fn().mockResolvedValue([{ topicName: 'test-topic', partition: 0, errorCode: 0, offset: '0' }]),
  sendBatch: vi.fn().mockResolvedValue([]),
  on: vi.fn(),
  events: {},
};

export const kafkaConsumerMock = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  seek: vi.fn(),
  on: vi.fn(),
  events: {},
};

export const kafkaAdminMock = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  createTopics: vi.fn().mockResolvedValue(true),
  deleteTopics: vi.fn().mockResolvedValue(undefined),
  listTopics: vi.fn().mockResolvedValue(['test-topic']),
  listGroups: vi.fn().mockResolvedValue({ groups: [] }),
};

/** The kafka instance mock that mimics `new Kafka(config)` */
export const kafkaMock = {
  producer: vi.fn().mockReturnValue(kafkaProducerMock),
  consumer: vi.fn().mockReturnValue(kafkaConsumerMock),
  admin: vi.fn().mockReturnValue(kafkaAdminMock),
};

/** Reset all Kafka mocks */
export function resetKafkaMock(): void {
  for (const obj of [kafkaProducerMock, kafkaConsumerMock, kafkaAdminMock, kafkaMock]) {
    for (const fn of Object.values(obj)) {
      if (typeof (fn as { mockReset?: () => void })?.mockReset === 'function') {
        (fn as { mockReset: () => void }).mockReset();
      }
    }
  }
  // Restore default return values
  kafkaMock.producer.mockReturnValue(kafkaProducerMock);
  kafkaMock.consumer.mockReturnValue(kafkaConsumerMock);
  kafkaMock.admin.mockReturnValue(kafkaAdminMock);
}
