import React from "react";
import FileContent from "./FileContent";

export default function test() {
  const oldText = `function hello() {
  console.log("hello");
}
console.log("end");`;


  const newText = `function hello(name) {
  console.log("hello " + name);
}
// new comment
console.log("end");`;

  return (
    <div style={{ padding: 20 }}>
      <h2>Diff Test</h2>
      <FileContent language="javascript" fileContent={newText} previousContent={oldText} />
    </div>
  );
}
