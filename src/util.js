
const observer = [onNext, onError, onCompleted];

const deserialize = record => {
  try {
    return {
      ...record,
      value: JSON.parse(record.value)
    };
  } catch (err) {
    console.log("Deserializer - error: ", err);
  }
};


module.exports = {
  observer,
  deserialize,
};
