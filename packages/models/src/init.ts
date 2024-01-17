import * as AllModels from "./index";

console.log(Object.values(AllModels).map(e => e.createTableDefinition).join("\n"));