import { evaluateSLAStatus } from '../src';

beforeEach(() => {
  jest
    .spyOn(Date, 'now')
    .mockImplementation(() => new Date('2024-01-01T00:00:00Z').getTime());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SLAHelper', () => {
  describe('evaluateSLAStatus', () => {
    // Case when FRT SLA is missed
    it('correctly identifies a missed FRT SLA', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704066540,
      };
      const chat = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 0,
        waiting_since: 0,
        status: 'open',
      };
      expect(
        evaluateSLAStatus({
          appliedSla,
          chat,
        })
      ).toEqual({
        type: 'FRT',
        threshold: '1m',
        icon: 'flame',
        isSlaMissed: true,
      });
    });

    // Case when FRT SLA is not missed
    it('correctly identifies an FRT SLA not yet breached', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704066660,
      };
      const chat = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 0,
        waiting_since: 0,
        status: 'open',
      };
      expect(evaluateSLAStatus({ appliedSla, chat })).toEqual({
        type: 'FRT',
        threshold: '1m',
        icon: 'alarm',
        isSlaMissed: false,
      });
    });

    // Case when NRT SLA is missed
    it('correctly identifies a missed NRT SLA', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704065200,
      };

      const chat = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 1704066200,
        waiting_since: 1704065940,
        status: 'open',
      };
      expect(evaluateSLAStatus({ appliedSla, chat })).toEqual({
        type: 'NRT',
        threshold: '1m',
        icon: 'flame',
        isSlaMissed: true,
      });
    });

    // Case when NRT SLA is not missed
    it('correctly identifies an NRT SLA not yet breached', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704065200 - 2000,
      };
      const chat = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 1704066200,
        waiting_since: 1704066060,
        status: 'open',
      };
      expect(evaluateSLAStatus({ appliedSla, chat })).toEqual({
        type: 'NRT',
        threshold: '1m',
        icon: 'alarm',
        isSlaMissed: false,
      });
    });

    // Case when RT SLA is missed
    it('correctly identifies a missed RT SLA', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704065340,
      };
      const chatMissed = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 1704066200,
        waiting_since: 0,
        status: 'open',
      };
      expect(evaluateSLAStatus({ appliedSla, chat: chatMissed })).toEqual({
        type: 'RT',
        threshold: '1m',
        icon: 'flame',
        isSlaMissed: true,
      });
    });

    // Case when RT SLA is not missed
    it('correctly identifies an RT SLA not yet breached', () => {
      const appliedSla = {
        id: 1,
        name: 'FRT',
        description: 'First Response Time',
        only_during_business_hours: false,
        sla_first_response_time_threshold: 600,
        sla_next_response_time_threshold: 1200,
        sla_resolution_time_threshold: 1800,
        created_at: 1704065460,
      };
      const chat = {
        meta: {
          assignee: null,
          sender: {
            id: 1,
          },
        },
        id: 1,
        custom_attributes: {},
        first_reply_created_at: 1704066200,
        waiting_since: 0,
        status: 'open',
      };
      expect(evaluateSLAStatus({ appliedSla, chat })).toEqual({
        type: 'RT',
        threshold: '1m',
        icon: 'alarm',
        isSlaMissed: false,
      });
    });
  });
});
