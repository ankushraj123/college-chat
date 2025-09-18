const badWords = ["badword1", "badword2", "badword3"]; // Example bad words

export const filterMessage = (message: string) => {
  let filteredMessage = message;
  badWords.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filteredMessage = filteredMessage.replace(regex, "****");
  });
  return filteredMessage;
};