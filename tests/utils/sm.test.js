const sm = require('../../src/utils/sm')

describe('sm', () => {
  let repetitionItem

  beforeEach(() => {
    repetitionItem = sm.createRepetitionItem(1, 1, 2)
  })

  test('createRepetitionItem', async () => {
    const { interval, easinessFactor, user, question } = repetitionItem
    expect(interval).toBe(1)
    expect(easinessFactor).toBe(1.96)
    expect(user).toBe(1)
    expect(question).toBe(2)
  })

  test('getUpdatedParams', async () => {
    const { interval, easinessFactor } = sm.getUpdatedParams(repetitionItem, 5)
    expect(interval).toBe(6)
    expect(easinessFactor).toBe(2.06)

    // Check lower bound of easiness factor
    expect(sm.getUpdatedParams(repetitionItem, -100).easinessFactor).toBe(1.3)

    // Check the reset of interval
    expect(sm.getUpdatedParams(repetitionItem, 1).interval).toBe(1)
  })
})
