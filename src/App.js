import "./App.css";
import { useState } from "react";

function groupBy(objects, property) {
  // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
  // value for property (obj[property])
  if (typeof property !== "function") {
    const propName = property;
    property = (obj) => obj[propName];
  }

  const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
  for (const object of objects) {
    const groupName = property(object);
    //Make sure that the group exists
    if (!groupedObjects.has(groupName)) {
      groupedObjects.set(groupName, []);
    }
    groupedObjects.get(groupName).push(object);
  }

  // Create an object with the results. Sort the keys so that they are in a sensible "order"
  const result = {};
  for (const key of Array.from(groupedObjects.keys()).sort()) {
    result[key] = groupedObjects.get(key);
  }
  return result;
}

function addS(num) {
  if (num === 1) {
    return "";
  } else {
    return "s";
  }
}



function App() {
  const [input, setInput] = useState("");
  const [savedWords, setSavedWords] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [displayList, setDisplayList] = useState(<ul></ul>);

  const makeDisplayList = (data, isRhyme) =>{
    if(data.length ===0){
      setDisplayName("(no results)")
      return
    }
    if (isRhyme) {
      data = groupBy(data, "numSyllables");
      let result = [];
      for (let group in data) {
        result.push(
          <div key={Math.random()}>
            <h3 >{group+' syllable'+addS(Number)}</h3>
            <ul>
              {data[group].map((item) => {
                return (
                  <li key={Math.random()}>
                    {item.word}
                    <button className="btn btn-outline-success" onClick={()=>{
                      setSavedWords((savedWords)=>{
                        const tmpList = savedWords.concat();
                        tmpList.push(item.word)
                        return tmpList
                      })
                    }}>(save)</button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      return result;
    }else{
      return data.map((item)=>(
        <li key={Math.random()}>
                    {item.word}
                    <button className="btn btn-outline-success" onClick={()=>{
                      setSavedWords((savedWords)=>{
                        const tmpList = savedWords.concat();
                        tmpList.push(item.word)
                        return tmpList
                      })
                    }}>(save)</button>
                  </li>
      ))
    }
  }

  const handleRhymesClick = () => {
    setDisplayName("...loading");
    setDisplayList();
    fetch(
      `https://api.datamuse.com/words?${new URLSearchParams({
        rel_rhy: input,
      }).toString()}`
    )
      .then((response) => response.json())
      .then(
        (data) => {
          setDisplayName(`Words that rhyme with ${input}: `);
          setDisplayList(makeDisplayList(data, true));
        },
        (err) => {
          console.error(err);
        }
      );
  }

  const handleSynonymsClick = () => {
    setDisplayList("...loading")
    setDisplayList();
    fetch(
      `https://api.datamuse.com/words?${new URLSearchParams({
        ml: input,
      }).toString()}`
    )
      .then((response) => response.json())
      .then(
        (data) => {
          setDisplayName(`Words that rhyme with ${input}: `);
          setDisplayList(makeDisplayList(data, false));
        },
        (err) => {
          console.error(err);
        }
      );
  }

  const handleKeyDown = (event) =>{
    if (event.key === 'Enter'){
      handleRhymesClick()
    }
  }
  
  return (
    <div className="App">
      <div>Repo address: <a href="https://github.com/zhijiezh/SI579-Problem-Set-6" target="_blank">https://github.com/zhijiezh/SI579-Problem-Set-6</a></div>
      <div>
        <h1 className="row">Rhyme Finder (579 Problem Set 6)</h1>
        <div className="row">
          <div className="col">
            Saved words: <span id="saved_words">{savedWords.join(", ")}</span>
          </div>
        </div>
        <div className="row">
          <div className="input-group col">
            <input
              className="form-control"
              type="text"
              placeholder="Enter a word"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              id="show_rhymes"
              type="button"
              className="btn btn-primary"
              onClick={handleRhymesClick}
            >
              Show rhyming words
            </button>
            <button
              id="show_synonyms"
              type="button"
              className="btn btn-secondary"
              onClick={handleSynonymsClick}
            >
              Show synonyms
            </button>
          </div>
        </div>
        <div className="row">
          <h2 className="col" id="output_description">
            {displayName}
          </h2>
        </div>
        <div className="output row">
          <output id="word_output" className="col">
            {displayList}
          </output>
        </div>
      </div>
    </div>
  );
}

export default App;
