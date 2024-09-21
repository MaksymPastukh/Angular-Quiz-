export  type ResultValueType = {
  test: ResultTest,
}

export type ResultTest = {
  "id": number,
  "name": string,
  "questions": Array<ResultQuestionType>
}

export type ResultQuestionType = {
  id: number,
  question: string,
  answers: Array<ResultAnswerType>
}

export type ResultAnswerType = {
  id: number,
  answer: string
  correct?: boolean
}