const moment = require('moment')

// Multiplier is used to set the dispersion of the interval
const multiplier = 2
const calculateInterval = (oldInterval, easinessFactor) => oldInterval * easinessFactor * multiplier

// Algorithm: https://www.supermemo.com/english/ol/sm2.htm
const calculateNewEasinessFactor = (ef, aq) => ef + (0.1 - (5 - aq) * (0.08 + (5 - aq) * 0.02))

// Returns a repetition item with default params
const createRepetitionItem = (answerQuality, userId, questionId) => {
  const now = new Date()

  // Interval starts from 1 minute
  const interval = 1

  // Calculate the time when to repeat the question
  const nextDate = moment(now).add(interval, 'm').toDate()

  // Initially the easiness factor is set to 2.5
  const easinessFactor = calculateNewEasinessFactor(2.5, answerQuality)

  return {
    nextDate: (nextDate.getTime() / 1000),
    interval,
    easinessFactor,
    user: userId,
    question: questionId
  }
}

const getUpdatedParams = (previousRepetitionitem, answerQuality) => {
  // Update easiness factor, whose min value is 1.3
  const easinessFactor = Math.max(calculateNewEasinessFactor(previousRepetitionitem.easinessFactor, answerQuality), 1.3)

  // Calculate the new interval
  let interval = previousRepetitionitem.interval === 1 ? 6 : calculateInterval(previousRepetitionitem.interval, easinessFactor)
  if (answerQuality === 1) {
    interval = 1
  }

  // Calculate the time when to repeat the question
  const now = new Date()
  const nextDate = moment(now).add(interval, 'm').toDate()

  return {
    nextDate: nextDate.getTime() / 1000,
    interval,
    easinessFactor,
  }
}

module.exports = {
  createRepetitionItem,
  getUpdatedParams
}