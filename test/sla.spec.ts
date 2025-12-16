import { evaluateSLAStatus, type BusinessHoursConfig, type SLACalculationOptions } from '../src';

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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW123',
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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW123',
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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW124',
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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW125',
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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW126',
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
          assignee: {
            id: 1,
          },
          sender: {
            id: 1,
          },
        },
        id: 1,
        code: 'CW127',
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

    // Case when no SLA data provided
    it('returns empty SLA status when no data provided', () => {
      expect(evaluateSLAStatus({ appliedSla: null, chat: null })).toEqual({
        type: '',
        threshold: '',
        icon: '',
        isSlaMissed: false,
      });
    });
  });

  describe('evaluateSLAStatus with Business Hours', () => {
    const businessHoursConfig: BusinessHoursConfig = {
      working_hours_enabled: true,
      timezone: 'America/New_York',
      working_hours: {
        sun: null, // Closed
        mon: { start: '09:00', finish: '17:30' },
        tue: { start: '09:00', finish: '17:30' },
        wed: { start: '09:00', finish: '17:30' },
        thu: { start: '09:00', finish: '17:30' },
        fri: { start: '09:00', finish: '17:30' },
        sat: null, // Closed
      },
      only_during_business_hours: true,
    };

    const options: SLACalculationOptions = {
      businessHours: businessHoursConfig,
    };

    describe('when business hours are enabled', () => {
      beforeEach(() => {
        // Mock time to Monday 10:00 AM EST (during business hours)
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-01T15:00:00Z').getTime()); // Monday 10:00 AM EST
      });

      it('calculates FRT SLA correctly during business hours', () => {
        const appliedSla = {
          id: 1,
          name: 'Business Hours FRT',
          description: 'First Response Time with Business Hours',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600, // 1 hour
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(new Date('2024-01-01T14:30:00Z').getTime() / 1000), // Monday 9:30 AM EST
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-BH-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('FRT');
        expect(result.isSlaMissed).toBe(false);
        expect(result.icon).toBe('alarm');
      });

      it('handles conversation created outside business hours', () => {
        const appliedSla = {
          id: 1,
          name: 'Weekend FRT',
          description: 'First Response Time created on weekend',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600, // 1 hour
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(new Date('2023-12-31T15:00:00Z').getTime() / 1000), // Sunday 10:00 AM EST
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-BH-002',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        // Mock current time to Monday during business hours
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-01T15:00:00Z').getTime()); // Monday 10:00 AM EST

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('FRT');
        // Should not be missed since counting starts Monday 9:00 AM + 1 hour = 10:00 AM
        expect(result.isSlaMissed).toBe(false);
      });

      it('handles NRT SLA during business hours', () => {
        const appliedSla = {
          id: 1,
          name: 'Business Hours NRT',
          description: 'Next Response Time with Business Hours',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 1800, // 30 minutes
          sla_next_response_time_threshold: 3600, // 1 hour
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(new Date('2024-01-01T14:00:00Z').getTime() / 1000), // Monday 9:00 AM EST
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-BH-003',
          custom_attributes: {},
          first_reply_created_at: Math.floor(new Date('2024-01-01T14:15:00Z').getTime() / 1000), // 9:15 AM EST
          waiting_since: Math.floor(new Date('2024-01-01T14:45:00Z').getTime() / 1000), // 9:45 AM EST
          status: 'open',
        };

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('NRT');
        expect(result.isSlaMissed).toBe(false);
        expect(result.icon).toBe('alarm');
      });

      it('handles RT SLA spanning multiple days with weekends', () => {
        // Mock to Friday afternoon
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-05T22:00:00Z').getTime()); // Friday 5:00 PM EST

        const appliedSla = {
          id: 1,
          name: 'Multi-day RT',
          description: 'Resolution Time spanning weekend',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 1800,
          sla_next_response_time_threshold: 3600,
          sla_resolution_time_threshold: 28800, // 8 hours (spans weekend)
          created_at: Math.floor(new Date('2024-01-05T20:00:00Z').getTime() / 1000), // Friday 3:00 PM EST
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-BH-004',
          custom_attributes: {},
          first_reply_created_at: Math.floor(new Date('2024-01-05T20:15:00Z').getTime() / 1000),
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('RT');
        // Should not be missed - 8 hours from Friday 3:00 PM = Monday morning
        expect(result.isSlaMissed).toBe(false);
      });
    });

    describe('when business hours are disabled', () => {
      const standardOptions: SLACalculationOptions = {
        businessHours: {
          ...businessHoursConfig,
          only_during_business_hours: false,
        },
      };

      it('falls back to calendar time calculation', () => {
        const appliedSla = {
          id: 1,
          name: 'Standard FRT',
          description: 'First Response Time without Business Hours',
          only_during_business_hours: false,
          sla_first_response_time_threshold: 3600, // 1 hour
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(new Date('2023-12-31T15:00:00Z').getTime() / 1000), // Sunday
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-STD-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        // Mock to 2 hours after creation (should be missed)
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2023-12-31T17:00:00Z').getTime());

        const result = evaluateSLAStatus({ appliedSla, chat, options: standardOptions });
        
        expect(result.type).toBe('FRT');
        expect(result.isSlaMissed).toBe(true);
        expect(result.icon).toBe('flame');
      });

      it('uses standard calculation when no options provided', () => {
        const appliedSla = {
          id: 1,
          name: 'Standard FRT No Options',
          description: 'First Response Time with no options',
          only_during_business_hours: false,
          sla_first_response_time_threshold: 1800, // 30 minutes
          sla_next_response_time_threshold: 3600,
          sla_resolution_time_threshold: 7200,
          created_at: Math.floor(new Date('2024-01-01T14:00:00Z').getTime() / 1000),
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-STD-002',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        // Mock to 45 minutes after creation (should be missed)
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-01T14:45:00Z').getTime());

        const result = evaluateSLAStatus({ appliedSla, chat }); // No options
        
        expect(result.type).toBe('FRT');
        expect(result.isSlaMissed).toBe(true);
        expect(result.icon).toBe('flame');
      });
    });

    describe('edge cases and error handling', () => {
      it('handles invalid timezone gracefully', () => {
        const invalidTimezoneConfig: BusinessHoursConfig = {
          ...businessHoursConfig,
          timezone: 'Invalid/Timezone',
        };

        const appliedSla = {
          id: 1,
          name: 'Invalid Timezone',
          description: 'Test invalid timezone handling',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600,
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-ERR-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ 
          appliedSla, 
          chat, 
          options: { businessHours: invalidTimezoneConfig } 
        });
        
        // Should not throw error and return valid result
        expect(result.type).toBe('FRT');
        expect(result).toHaveProperty('threshold');
        expect(result).toHaveProperty('icon');
        expect(result).toHaveProperty('isSlaMissed');
      });

      it('handles missing working hours configuration', () => {
        const missingHoursConfig: BusinessHoursConfig = {
          working_hours_enabled: true,
          timezone: 'UTC',
          working_hours: {}, // Empty working hours
          only_during_business_hours: true,
        };

        const appliedSla = {
          id: 1,
          name: 'Missing Hours',
          description: 'Test missing working hours',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600,
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(Date.now() / 1000) - 1800,
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-ERR-002',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ 
          appliedSla, 
          chat, 
          options: { businessHours: missingHoursConfig } 
        });
        
        // Should handle gracefully and return result
        expect(result).toBeDefined();
        expect(typeof result.threshold).toBe('string');
      });

      it('handles null working hours for all days', () => {
        const allClosedConfig: BusinessHoursConfig = {
          working_hours_enabled: true,
          timezone: 'UTC',
          working_hours: {
            sun: null,
            mon: null,
            tue: null,
            wed: null,
            thu: null,
            fri: null,
            sat: null,
          },
          only_during_business_hours: true,
        };

        const appliedSla = {
          id: 1,
          name: 'All Closed',
          description: 'Test all days closed',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600,
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          created_at: Math.floor(Date.now() / 1000) - 1800,
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-ERR-003',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ 
          appliedSla, 
          chat, 
          options: { businessHours: allClosedConfig } 
        });
        
        // Should handle gracefully
        expect(result).toBeDefined();
      });

      it('handles conversation created at exact business hour boundaries', () => {
        const appliedSla = {
          id: 1,
          name: 'Boundary Test',
          description: 'Test exact boundary times',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 3600,
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 14400,
          // Created exactly at 9:00 AM (start of business hours)
          created_at: Math.floor(new Date('2024-01-01T14:00:00Z').getTime() / 1000),
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-BND-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        // Mock to exactly 1 hour later (10:00 AM)
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-01T15:00:00Z').getTime());

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('FRT');
        expect(result.isSlaMissed).toBe(false); // Should be exactly at deadline
      });
    });

    describe('working hours utility functions', () => {
      it('correctly identifies working hours', () => {
        const appliedSla = {
          id: 1,
          name: 'Working Hours Test',
          description: 'Test working hours detection',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 1800, // 30 minutes
          sla_next_response_time_threshold: 3600,
          sla_resolution_time_threshold: 7200,
          created_at: Math.floor(new Date('2024-01-01T14:30:00Z').getTime() / 1000), // 9:30 AM EST
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-WH-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        // Test during business hours (10:00 AM EST)
        jest
          .spyOn(Date, 'now')
          .mockImplementation(() => new Date('2024-01-01T15:00:00Z').getTime());

        const result = evaluateSLAStatus({ appliedSla, chat, options });
        
        expect(result.type).toBe('FRT');
        expect(result.isSlaMissed).toBe(false);
      });

      it('correctly handles different working hour patterns', () => {
        const customHoursConfig: BusinessHoursConfig = {
          working_hours_enabled: true,
          timezone: 'UTC',
          working_hours: {
            sun: null,
            mon: { start: '08:00', finish: '12:00' }, // Half day
            tue: { start: '09:00', finish: '17:00' },
            wed: { start: '10:00', finish: '18:00' },
            thu: { start: '09:00', finish: '17:00' },
            fri: { start: '08:00', finish: '16:00' },
            sat: { start: '10:00', finish: '14:00' }, // Short day
          },
          only_during_business_hours: true,
        };

        const appliedSla = {
          id: 1,
          name: 'Custom Hours',
          description: 'Test custom working hours',
          only_during_business_hours: true,
          sla_first_response_time_threshold: 14400, // 4 hours
          sla_next_response_time_threshold: 7200,
          sla_resolution_time_threshold: 28800,
          created_at: Math.floor(new Date('2024-01-01T10:00:00Z').getTime() / 1000), // Monday 10:00 AM UTC
        };

        const chat = {
          meta: { assignee: { id: 1 }, sender: { id: 1 } },
          id: 1,
          code: 'CW-CH-001',
          custom_attributes: {},
          first_reply_created_at: 0,
          waiting_since: 0,
          status: 'open',
        };

        const result = evaluateSLAStatus({ 
          appliedSla, 
          chat, 
          options: { businessHours: customHoursConfig } 
        });
        
        expect(result.type).toBe('FRT');
        expect(result).toHaveProperty('threshold');
      });
    });
  });
});
