//Global variables for warnins and program counter
let warningCounter = 0;
let pgmCounter = 1;
let warnings = [];
//clearAst clears the text box for the AST
function clearAst() {
    document.getElementById("AST").value = "";
}
//clearCst clears the text box for the CST
function clearCST() {
    document.getElementById("CST").value = "";
}
//clearTable will clear the table childs except for the headers. 
function clearTable() {
    var elmtTable = document.getElementById('table');
    var tableRows = elmtTable.getElementsByTagName('tr');
    var rowCount = tableRows.length;
    for (var x = rowCount - 1; x > 0; x--) {
        elmtTable.removeChild(tableRows[x]);
    }
}
function clearCodeGen(flag = false) {
    if (flag == false) {
        document.getElementById("Gen").value = "";
    }
    jumpTable = [];
    staticTable = [];
    tempCounter = 0;
    firstAssign = null;
    image = new Array(255);
    imageCounter = 0;
    staticStart = 0;
    offset = 0;
    whileStackmentCheck = [];
    newStatic = "";
    declaration;
    ifStatementCheck = [];
    EqualsCheck = [];
    jumpCounter = 0;
    scopeCounter = 0;
    heapCounter = 255;
    getTableEntry;
    assignmentTemp = [];
    ultParent = "";
    printTemp = 0;
    printEnd = "";
    additionStatementCheck = [];
    assignmentStatementCheck = [];
    newJumpTable = [];
    whileStorage = [];
    middleJump;
    whileTable = [];
    variableTemp = null;
    variableTemp2 = null;
    additonCounter = 0;
    equalsTemp = null;
    leftSide = null;
    rightSide = null;
    printStatement = [];
    ifStatementJump = 0;
    storeInstructions = [];
}
function getData() {
    let tokenStream = [];
    let input = document.getElementById("Input").value;
    let splittedInput = input.split("$");
    //The clear functions reset everything on the html page.. effectively making text boxs blank
    clearOutput();
    clearAst();
    clearCST();
    clearTable();
    clearCodeGen();
    pgmCounter = 1;
    warningCounter = 0;
    if (input[input.length - 1] != "$") {
        splittedInput.push('');
    }
    //This loop goes through the token stream and splits it by the $ sign. 
    for (let i = 0; i < splittedInput.length; i++) {
        warningCounter = 0;
        //lexing starts here
        if (splittedInput[i].trim().length == 0) {
            imageCounter = 0;
            continue;
        }
        if (splittedInput.length > 1) {
            if (i == 0) {
                splittedInput.pop();
            }
            tokenStream = this.lexGreedyApproach(splittedInput[i] + "$");
        }
        else {
            tokenStream = this.lexGreedyApproach(splittedInput[i]);
        }
        //parsing starts here
        let cstTraversal;
        if (tokenStream) {
            let parser = new Parser(tokenStream);
            try {
                output("INFO PARSER - Parsing program " + pgmCounter);
                parser.parseStart();
            }
            catch (error) {
                this.output("INFO PARSER - Parser failed with 1 error. Not Printing CST.\n");
                console.log(error);
                continue;
            }
            ;
            this.output("INFO PARSER - Parser Passed. Printing CST.\n");
            cstTraversal = parser.SyntaxTree.toString();
            document.getElementById("CST").value += cstTraversal + "\n";
            let CSTTreeAntArray = [];
            var dict = {};
            CSTTreeAntArray.push(cstConfig);
            const map1 = new Map();
            //This for loop goes through every node and creates a Treant representation according to the Treant Docs.
            //The Docs can be found at https://fperucic.github.io/treant-js/
            //This could actually be done after the first for loop to save time. I just wanted things to happen in sequence instead of printing after everything
            for (let j = 0; j < parser.SyntaxTree.depth2.length; j++) {
                let currentNode = parser.SyntaxTree.depth2[j];
                if (j == 0) {
                    let rootNode = {
                        text: { name: currentNode.name },
                        node: currentNode
                    };
                    CSTTreeAntArray.push(rootNode);
                    dict[currentNode] = rootNode;
                    map1.set(currentNode, rootNode);
                    continue;
                }
                let nextNode = {
                    parent: map1.get(currentNode.parent),
                    text: { name: currentNode.name },
                    node: currentNode
                };
                dict[currentNode] = nextNode;
                map1.set(currentNode, nextNode);
                CSTTreeAntArray.push(nextNode);
            }
            //Puts the array of the objects into the simple_char_config variable for treant to utilize
            cstChart = CSTTreeAntArray;
            //This initialized the new Treant object with our array of objects
            this.createCST(cstChart);
        }
        //Semantic Analysis starts here. We shouldn't get an error in this parse because the parse for the CST validated everything in our language.
        //parsing starts here
        //This creates the AST parser object and starts the parsing 
        let astTraversal;
        let astParser = new AstParser(tokenStream);
        astParser.parseStart();
        astTraversal = astParser.SyntaxTree.toString();
        let astTreeantArray = [];
        astTreeantArray.push(astConfig);
        const map2 = new Map();
        //This line is for multiple programs in the AST text box. It seperates the programs by a space.
        document.getElementById("AST").value += astTraversal + "\n";
        //This for loop goes through every node and creates a Treant representation according to the Treant Docs.
        //The Docs can be found at https://fperucic.github.io/treant-js/
        //This could actually be done after the first for loop to save time. I just wanted things to happen in sequence instead of printing after everything
        for (let j = 0; j < astParser.SyntaxTree.depth2.length; j++) {
            let currentNode = astParser.SyntaxTree.depth2[j];
            if (j == 0) {
                //this is the node style for the Treant object
                let rootNode = {
                    text: { name: currentNode.name },
                    node: currentNode
                };
                astTreeantArray.push(rootNode);
                dict[currentNode] = rootNode;
                map2.set(currentNode, rootNode);
                continue;
            }
            //This is the node style for the Treant object
            let nextNode = {
                parent: map2.get(currentNode.parent),
                text: { name: currentNode.name },
                node: currentNode
            };
            dict[currentNode] = nextNode;
            map2.set(currentNode, nextNode);
            astTreeantArray.push(nextNode);
        }
        astChart = astTreeantArray;
        //This initialized the new Treant object with our array of objects
        this.createCST(astChart);
        //initialize new scope tree to be sent to the scopeChecker function
        let scopeTree = new ScopeTree();
        //Try-catch block for scope and type checking. 
        try {
            output("INFO SEMANTIC - Analyzing Program " + pgmCounter);
            scopeChecker(astParser.SyntaxTree.root, scopeTree);
            if (astParser.SyntaxTree.root.children < 1) {
            }
            else {
                scopeTree.toSymbolTable();
            }
            output("INFO SEMANTIC - PROGRAM SUCCESSFULLY FINISHED WITH 0 ERRORS AND " + warningCounter + " WARNINGS");
            output("");
        }
        catch (error) {
            output("DEBUG SEMANTIC - ERROR - " + error);
            output("INFO SEMANTIC - PROGRAM FINISHED WITH 1 ERROR");
            output("");
            //if there is an error just continue
            pgmCounter += 1;
            continue;
        }
        pgmCounter += 1;
        let codeGenerator = new CodeGen();
        codeGenerator.astRoot = astParser.SyntaxTree.root;
        output("INFO - Code Gen - Starting Code Gen");
        codeGenerator.populateImage();
        codeGenerator.initializeBooleansInHeap();
        try {
            codeGenerator.codeGeneration();
            console.log(image);
        }
        catch (error) {
            if (imageCounter >= heapCounter) {
                output("ERROR - Code Gen - The image ran into the heap");
                output("INFO - Code Gen - Code Gen incompleted with 1 error");
            }
            output(error);
            clearCodeGen(true);
            continue;
        }
        codeGenerator.staticCounterToHex();
        output("INFO - Code Gen - Backpatching...");
        codeGenerator.backpatch();
        for (var b = 0; b < 256; b++) {
            document.getElementById("Gen").value += image[b] + " ";
        }
        output("INFO - Code Gen - Completed Code Gen with 0 errors.");
        document.getElementById("Gen").value += "\n\n\n";
        //reset globals
        clearCodeGen(true);
    }
    this.resetPgmCounter();
}
//Function for scope and type checking
function scopeChecker(root, scopeTree) {
    // Initialize the result string.
    let ultParent = "";
    let currentParent = "";
    let firstVar = null;
    let secondVar = null;
    let firstBool = null;
    let typeOfExpr = null;
    let warnings = [];
    // Recursive function to handle the expansion of the nodes.
    function expand(node, depth) {
        // Space out based on the current depth so
        // this looks at least a little tree-like.
        // If there are no children (i.e., leaf nodes)...
        if (!node.children || node.children.length === 0) {
            // ... note the leaf node.
            //if the currents nodes parents name is varDecl this if statement will be triggers
            if (node.parent.name == "VarDecl") {
                //firstVar is the variable for assignments
                //Every if statement that checks for the parent also has a check for firstVar
                //This is because assigment statements are treated differently from regular equals to, not equals to and addition ops
                //Variables need to have the initialized attribute turned to true. 
                if (firstVar == null) {
                    firstVar = node.name;
                }
                else {
                    secondVar = node.name;
                    if (secondVar in scopeTree.currentScope) {
                        throw new Error("Variable already declared in the current scope at " + node.line + "," + node.character);
                    }
                    output("DEBUG SEMANTIC - Variable Declared [" + secondVar + "] as Type " + firstVar + " at " + node.line + "," + node.character);
                    scopeTree.currentScope[secondVar] = { "type": firstVar, 'isUsed': false, 'isInitialized': false, "scope": scopeTree.currentScopeNum, "line": node.line, "char": node.character };
                    firstVar = null;
                    secondVar = null;
                }
            }
            //Assignment Statement Encounter
            else if (node.parent.name == "Assignment Statement") {
                if (firstVar == null) {
                    firstVar = node.name;
                    if (checkScope(firstVar, scopeTree)) {
                        //continue
                    }
                    else {
                        //TODO: throw error when variable initialized before being declared.
                        throw new Error("Variable initialized before being declared at line at " + node.line + "," + node.character);
                    }
                }
                else {
                    secondVar = node.name;
                    let found = false;
                    let currentNodde = scopeTree.currentNode;
                    while (scopeTree.currentNode != root) {
                        if (firstVar in scopeTree.currentNode.scope) {
                            found = true;
                            break;
                        }
                        if (scopeTree.currentNode.parent == null) {
                            break;
                        }
                        scopeTree.currentNode = scopeTree.currentNode.parent;
                    }
                    let foundSecond = false;
                    let currentNoddeForSecond = scopeTree.currentNode;
                    if (/^[a-z]$/.test(secondVar)) {
                        //while loop for finding the variable in a scope
                        while (currentNoddeForSecond != root) {
                            if (secondVar in currentNoddeForSecond.scope) {
                                foundSecond = true;
                            }
                            if (currentNoddeForSecond.parent == null) {
                                break;
                            }
                            currentNoddeForSecond = currentNoddeForSecond.parent;
                        }
                    }
                    //output success if types are boolean 
                    if (scopeTree.currentNode.scope[firstVar]['type'] == 'int' && /^[0-9]$/.test(secondVar)) {
                        scopeTree.currentNode.scope[firstVar]['isInitialized'] = true;
                        output("DEBUG SEMANTIC - SUCCESS: Variable " + firstVar + " has been initialized with the correct type as int at " + node.line + "," + node.character);
                        scopeTree.currentNode = currentNodde;
                    }
                    //output success if types are boolean 
                    else if (scopeTree.currentNode.scope[firstVar]['type'] == 'string' && secondVar[0] == "'") {
                        scopeTree.currentNode.scope[firstVar]['isInitialized'] = true;
                        output("DEBUG SEMANTIC - SUCCESS: Variable [" + firstVar + "] has been initialized with the correct type as string at " + node.line + "," + node.character);
                        scopeTree.currentNode = currentNodde;
                    }
                    //output success if types are boolean 
                    else if (scopeTree.currentNode.scope[firstVar]['type'] == 'boolean' && (secondVar == 'true' || secondVar == "false")) {
                        scopeTree.currentNode.scope[firstVar]['isInitialized'] = true;
                        output("DEBUG SEMANTIC - SUCCESS: Variable " + firstVar + " has been initialized with the correct type as boolean at " + node.line + "," + node.character);
                        scopeTree.currentNode = currentNodde;
                    }
                    //final else if for assignment to id
                    else if (foundSecond == true) {
                        if (currentNoddeForSecond.scope[firstVar]['type'] == currentNoddeForSecond.scope[secondVar]['type']) {
                            currentNoddeForSecond.scope[firstVar]['isInitialized'] = true;
                            output("DEBUG SEMANTIC - SUCCESS: Variable " + firstVar + " has been initialized at " + node.line + "," + node.character);
                        }
                        else {
                            //TODO THROW ERROR when mismatch
                            throw new Error("TYPE MISMATCH - TYPE OF: " + currentNoddeForSecond.scope[secondVar]['type'] + " Does Not match: " + currentNoddeForSecond.scope[firstVar]['type'] + "at " + node.line + "," + node.character);
                        }
                    }
                    else {
                        if (!(secondVar in scopeTree.currentScope) && /^[a-z]$/.test(secondVar)) {
                            //Variable assigned to another variable which isnt in scope.. rip
                            let found = false;
                            let currentNodde = scopeTree.currentNode;
                            //This while loop just checks if the variable is in scope
                            while (currentNodde != root) {
                                if (secondVar in currentNodde.scope) {
                                    found = true;
                                }
                                if (currentNodde.parent == null) {
                                    break;
                                }
                                currentNodde = currentNodde.parent;
                            }
                            if (secondVar in currentNodde.scope) {
                                found = true;
                            }
                            //if variable is in scope, it will be initialized
                            if (found) {
                                output("DEBUG SEMANTIC - SUCCESS: Variable " + firstVar + " has been initialized at " + node.line + "," + node.character);
                            }
                            //if variable isn't in scope, an error will be thrown
                            else {
                                throw new Error("Varable " + secondVar + " is not in scope at " + node.line + "," + node.character);
                            }
                        }
                        else {
                            //Else condition if 
                            throw new Error("TYPE MISMATCH - TYPE OF: " + secondVar + " Does Not match: " + firstVar + "at " + node.line + ',' + node.character);
                        }
                    }
                    firstVar = null;
                    secondVar = null;
                }
            }
            //End Assignment statement
            //Start Print Statement
            else if (node.parent.name == "Print") {
                //This whole print block will only execute if the thing inside print is one production.
                //This means only id, true, false and strings will execute this. 
                //int exprs with addition ops and boolexpr will be excecuted else where.
                //Int exprs will be executed in the addition Op 'else if' statement
                //Bool Exprs will be executed 
                let checker;
                if (/^[a-z]$/.test(node.name)) {
                    //this function checks if some variable is in scope
                    checker = checkScope(node.name, scopeTree);
                }
                if (currentParent['children'].length == 1) {
                    if (node.name == "true" || node.name == "false" || node.name[0] == "'" || /^[0-9]$/.test(node.name)) {
                    }
                    //else must be an id because parse worked 
                    else {
                        //check variable is in scope we will say that the variable is used 
                        if (checker) {
                            output("DEBUG - SEMANTIC ANALYSIS - SUCCESS - Variable [" + node.name + "] is used in print statement at " + node.line + "," + node.character);
                            if (node.name in scopeTree.currentScope) {
                                if (scopeTree.currentScope[node.name]['isInitialized'] == false) {
                                    output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                    warningCounter += 1;
                                }
                                scopeTree.currentScope[node.name]['isUsed'] = true;
                            }
                            //if the node isnt in the current scope, we have to check every parent scope
                            else {
                                let currNode = scopeTree.currentNode;
                                while (scopeTree.currentNode != scopeTree.root) {
                                    scopeTree.currentNode = scopeTree.currentNode.parent;
                                    //if node is found we will set the isUsed attributed for the variable to true and will throw a warning if there the variable isn't initialized
                                    if (node.name in scopeTree.currentNode.scope) {
                                        if (scopeTree.currentNode.scope[node.name]['isInitialized'] == false) {
                                            output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                            warningCounter += 1;
                                            scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                            break;
                                        }
                                        else {
                                            scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                        }
                                    }
                                }
                                scopeTree.currentNode = currNode;
                            }
                        }
                        else {
                            // variable wasnt in any scope, throw error
                            throw new Error("Variable not in scope at " + node.line + "," + node.character);
                        }
                    }
                }
            }
            //End Statement
            //Start addition OP
            else if (node.parent.name == "Not Equals") {
                //This just checks to see if the other child is of the same type.
                //If it isn't there is an error.
                let first = getType(node.parent['children'][0]['name'], scopeTree, node);
                let second = getType(node.parent['children'][1]['name'], scopeTree, node);
                if (first != second) {
                    throw new Error("Cant match types " + first + " and " + second + " at " + node.line + "," + node.character);
                }
                //if firstVar is null, then we will accomodate the assignment operator
                if (firstVar != null) {
                    if (getTypeWithoutWarning(firstVar, scopeTree) == 'boolean') {
                        let currNode = scopeTree.currentNode;
                        //variable is in the current scope so we initialize the variable because were inside a firstVar if statement
                        if (firstVar in scopeTree.currentScope) {
                            scopeTree.currentScope[firstVar]['isInitialized'] = true;
                            output("DEBUG SEMANTIC - SUCCESS - Variable [ " + firstVar + " ] has been initialized at " + node.line + ", " + node.character);
                        }
                        else {
                            //checks every parent scope in this while loop 
                            while (scopeTree.currentNode != scopeTree.root) {
                                scopeTree.currentNode = scopeTree.currentNode.parent;
                                if (node.name in scopeTree.currentNode.scope) {
                                    scopeTree.currentNode.scope[firstVar]['isInitialized'] = true;
                                    output("DEBUG SEMANTIC - SUCCESS - Variable [ " + firstVar + " ] has been initialized at " + node.line + ", " + node.character);
                                }
                            }
                        }
                        scopeTree.currentNode = currNode;
                        firstVar = null;
                        secondVar = null;
                    }
                    //Throw error if anything in the boolean expr isnt compared to the same type
                    else {
                        throw new Error("Can't assign Bool Expr to type " + getType(firstVar, scopeTree, node) + " at " + node.line + ", " + node.character);
                    }
                }
            }
            else if (node.parent.name == "Equals To") {
                //This just checks to see if the other child is of the same type.
                //If it isn't there is an error.
                let first = getType(node.parent['children'][0]['name'], scopeTree, node);
                let second = getType(node.parent['children'][1]['name'], scopeTree, node);
                //This checks to see if first and second are of the same type
                if (first != second) {
                    throw new Error("Cant match types " + first + " and " + second + " at " + node.line + "," + node.character);
                }
                //if first var is null, this means were inside an assignment operator
                if (firstVar != null) {
                    if (getTypeWithoutWarning(firstVar, scopeTree) == 'boolean') {
                        let currNode = scopeTree.currentNode;
                        //variable is in the current scope so we initialize the variable because were inside a firstVar if statement
                        if (firstVar in scopeTree.currentScope) {
                            scopeTree.currentScope[firstVar]['isInitialized'] = true;
                            output("DEBUG SEMANTIC - SUCCESS - Variable [ " + firstVar + " ] has been initialized at " + node.line + ", " + node.character);
                        }
                        else {
                            //while loop checks if the variable is in the parent node
                            while (scopeTree.currentNode != scopeTree.root) {
                                scopeTree.currentNode = scopeTree.currentNode.parent;
                                if (node.name in scopeTree.currentNode.scope) {
                                    scopeTree.currentNode.scope[firstVar]['isInitialized'] = true;
                                    output("DEBUG SEMANTIC - SUCCESS - Variable [ " + firstVar + " ] has been initialized at " + node.line + ", " + node.character);
                                }
                            }
                        }
                        scopeTree.currentNode = currNode;
                        firstVar = null;
                        secondVar = null;
                    }
                    //Variable isn't of boolean type
                    else {
                        throw new Error("Can't assign Bool Expr to type " + getType(firstVar, scopeTree, node) + " at " + node.line + ", " + node.character);
                    }
                }
            }
            else if (node.parent.name == "Addition Op") {
                //this first if statement checks to see if the penultimate parent is an equals or not equals statement
                if (ultParent != "Equals To" && ultParent != "Not Equals") {
                    //if we are in an assignment statement we have to check if the firstVar is an int and the thing being added is an int
                    if (firstVar != null && getType(firstVar, scopeTree, node) != 'int') {
                        throw new Error("TYPE MISMATCH - Variable [ " + firstVar + " ] of type [ " + scopeTree.currentScope[firstVar]['type'] + " ]" + " Does not match Int expr at" + node.line + "," + node.character);
                    }
                    //This just checks a boolean expression isn't part of a addition expr. Not allowed in our language
                    if (currentParent['children'][1]['name'] == "Equals To" || currentParent['children'][1]['name'] == "Not Equals") {
                        throw new Error("Can't add Equals To or not Equals operator" + " to int expression at " + node.line + "," + node.character);
                    }
                    //This first checks if the current node isn't an int. Then it checks if its a variable
                    if (!(/^[0-9]$/.test(node.name))) {
                        if ((/^[a-z]$/.test(node.name))) {
                            //This 
                            let found = false;
                            let currNode = scopeTree.currentNode;
                            //Attempts to find the variable in the current scope
                            if (node.name in scopeTree.currentScope) {
                                scopeTree.currentScope[node.name]['isUsed'] = true;
                                if (scopeTree.currentScope[node.name]['isInitialized'] == false) {
                                    output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                    warningCounter += 1;
                                }
                                found = true;
                            }
                            else {
                                //variable wasn't found in the current scope so we have to check every parent scope
                                while (scopeTree.currentNode != scopeTree.root) {
                                    scopeTree.currentNode = scopeTree.currentNode.parent;
                                    if (node.name in scopeTree.currentNode.scope) {
                                        found = true;
                                        //if node was found and wasn't and int, then throw an error
                                        if (scopeTree.currentNode.scope[node.name]['type'] != 'int') {
                                            throw new Error("Can't add type " + scopeTree.currentNode.scope[node.name]['type'] + " to Type Int at " + node.line + "," + node.character);
                                        }
                                        //if node wasn't initialized and was found in an addition expr, throw an error and put isUsed for variable to true
                                        if (scopeTree.currentNode.scope[node.name]['isInitialized'] == false) {
                                            output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                            warningCounter += 1;
                                            scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                            break;
                                        }
                                        scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                    }
                                }
                            }
                            scopeTree.currentNode = currNode;
                            //Variable wasn't found in any scope so the program throw an error
                            if (found == false) {
                                throw new Error("Variable isn't in scope at " + node.line + "," + node.character);
                            }
                        }
                        //Throws error if it's not a variable or int because that's all that can be added in an addition expression.
                        else {
                            throw new Error("Cant add " + getType(node.name, scopeTree, node) + " to int expression at " + node.line + "," + node.character);
                        }
                    }
                    //If both children in an addition expr aren't addition exprs, this means we are at the end of an addition op and can initialize firstVar now
                    //Don't forget this was all in the first var variable
                    if (currentParent['children'][0] != "Addition Op" && currentParent['children'][1] != "Addition Op") {
                        if (firstVar != null) {
                            initialize(firstVar, scopeTree);
                            output("DEBUG SEMANTIC - SUCCESS - Variable [ " + firstVar + " ] is initialized at " + node.line + "," + node.character);
                        }
                        firstVar = null;
                        secondVar = null;
                    }
                }
                else {
                    if (firstBool == null) {
                        firstBool = node.name;
                        if (/^[0-9]$/.test(firstBool)) {
                            typeOfExpr = 'int';
                        }
                        else if (/^[a-z]$/.test(node.name)) {
                            if (firstBool in scopeTree.currentScope) {
                                typeOfExpr = scopeTree.currentScope[firstBool]['type'];
                            }
                        }
                        else if (node.name == "true" || node.name == "false") {
                            typeOfExpr = 'boolean';
                        }
                        else if (node.name[0] == "'") {
                            typeOfExpr = 'string';
                        }
                    }
                    else {
                        if (/^[a-z]$/.test(node.name)) {
                            //current node is an variable so we have to find it in the scopes :)
                            let found = false;
                            let currNode = scopeTree.currentNode;
                            //This checks if the node is in the current scope and will execute
                            if (node.name in scopeTree.currentScope) {
                                scopeTree.currentScope[node.name]['isUsed'] = true;
                                if (scopeTree.currentScope[node.name]['isInitialized'] == false) {
                                    output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                    warningCounter += 1;
                                }
                                found = true;
                            }
                            //node wasn't in the current scope, so we have to check the parent scope
                            else {
                                while (scopeTree.currentNode != scopeTree.root) {
                                    scopeTree.currentNode = scopeTree.currentNode.parent;
                                    //Node was found in a parent scope
                                    if (node.name in scopeTree.currentNode.scope) {
                                        //throw error if it's type isn't of int. only ints can be in addition exprs
                                        if (scopeTree.currentNode.scope[node.name]['type'] != 'int') {
                                            throw new Error("Variable of type " + scopeTree.currentNode.scope[node.name]['type'] + " at " + node.line + "," + node.character + " does not match type int");
                                        }
                                        found = true;
                                        //throw warning if variable wasn't initialized
                                        if (scopeTree.currentNode.scope[node.name]['isInitialized'] == false) {
                                            output("DEBUG - SEMANTIC ANALYSIS - WARNING - [" + node.name + "] was used before being initialized at " + node.line + "," + node.character);
                                            warningCounter += 1;
                                            scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                            break;
                                        }
                                        scopeTree.currentNode.scope[node.name]['isUsed'] = true;
                                    }
                                }
                                scopeTree.currentNode = currNode;
                            }
                            //Throw error if variable isn't in the current scope
                            if (found == false) {
                                throw new Error("Variable isn't in scope");
                            }
                        }
                        //Throw error if types don't match up 
                        else if (/^[0-9]$/.test(node.name)) {
                            if (typeOfExpr != 'int') {
                                throw new Error("Type of Int does not match " + getType(typeOfExpr, scopeTree, node));
                            }
                        }
                        //Throw error if types don't match up
                        else if (node.name[0] == "'") {
                            if (typeOfExpr != "string") {
                                throw new Error("Type of String does not match " + getType(typeOfExpr, scopeTree, node));
                            }
                        }
                        //Throw error if types don't match up
                        else if (node.name == "true" || node.name == "false") {
                            if (typeOfExpr != 'boolean') {
                                throw new Error("Type of boolean does not match " + getType(typeOfExpr, scopeTree, node));
                            }
                        }
                    }
                }
            }
            //End addition Op parent
            //Start While Statement
        }
        //Second block for interior nodes
        else {
            // There are children, so note these interior/branch nodes and ...
            // .. recursively expand them.
            currentParent = node;
            //This checks if the current node is a block and will add a node into the scopetree
            if (node.name == "Block") {
                if (scopeTree.root == null) {
                    scopeTree.addNode("root", scopeTree.currentScopeNum);
                }
                else {
                    scopeTree.currentScopeNum += 1;
                    scopeTree.addNode("branch", scopeTree.currentScopeNum);
                }
            }
            for (var i = 0; i < node.children.length; i++) {
                //This checks to see if the children are blocks which means we will expand on them and move up everything inside of that block.
                if (node.children[i].name == 'Block') {
                    expand(node.children[i], depth + 1);
                    scopeTree.currentScopeNum -= 1;
                    scopeTree.moveUp();
                    scopeTree.currentScope = scopeTree.currentNode.scope;
                }
                //this checks to see if the child is an equals statement or not equals statement.
                //It will set ultParent to "Equals To" and will tell the other part of the program that.
                else if (node.children[i].name == "Equals To" || node.children[i].name == "Not Equals") {
                    ultParent = "Equals To";
                    expand(node.children[i], depth + 1);
                    ultParent = "";
                    //reset variables
                    firstVar = null;
                    secondVar = null;
                }
                else if (node.children[i].name == "While Statement") {
                    firstBool = null;
                    expand(node.children[i], depth + 1);
                }
                else if (node.children[i].name == "If Statement") {
                    firstBool = null;
                    expand(node.children[i], depth + 1);
                }
                else {
                    expand(node.children[i], depth + 1);
                }
            }
        }
    }
    // Make the initial call to expand from the root.
    //Weird test case for only one block statement .
    if (!root.children || root.children.length < 1) {
    }
    else {
        expand(root, 0);
    }
    // Return the result.
}
;
//this function intializes something in the current scope or the parent scope
function initialize(node, scopeTree) {
    if (node in scopeTree.currentScope) {
        scopeTree.currentScope[node]['isInitialized'] = true;
    }
    else {
        let currNode = scopeTree.currentNode;
        while (scopeTree.currentNode != scopeTree.root) {
            scopeTree.currentNode = scopeTree.currentNode.parent;
            if (node in scopeTree.currentNode.scope) {
                scopeTree.currentNode.scope[node]['isInitialized'] = true;
            }
        }
        scopeTree.currentNode = currNode;
    }
}
//this function will get the type of a variable 
function getTypeWithoutWarning(type, scopeTree) {
    let currentNodde = scopeTree.currentNode;
    while (currentNodde != scopeTree.root) {
        if (type in currentNodde.scope) {
            return currentNodde.scope[type]['type'];
        }
        if (currentNodde.parent == null) {
            break;
        }
        currentNodde = currentNodde.parent;
    }
    if (type in currentNodde.scope) {
        return currentNodde.scope[type]['type'];
    }
    else {
        return false;
    }
}
//this function checks if a variable is in scope or in a parent scope
function checkScope(type, scopeTree) {
    let currentNodde = scopeTree.currentNode;
    while (currentNodde != scopeTree.root) {
        if (type in currentNodde.scope) {
            return true;
        }
        if (currentNodde.parent == null) {
            break;
        }
        currentNodde = currentNodde.parent;
    }
    if (type in currentNodde.scope) {
        return true;
    }
    else {
        return false;
    }
}
//When a test case is chosen on the html page, this function will execute and put one of these progams into the input
function tests(event) {
    var selectedElement = event.target;
    var value = selectedElement.text;
    if (value == "Alans Progam") {
        document.getElementById("Input").value = '{intaintba=0b=0while(a!=3){print(a)while(b!=3){print(b)b=1+bif(b==2){print("there isno spoon")}}b=0a=1+a}}$';
    }
    if (value == "JuiceC If Statement") {
        document.getElementById("Input").value = '{\nint a\na = 1\nif(1 == 1){\nprint("nums")\n}\nif(a == a){\nprint("ids")\n}\nif("hey" == "hey"){\nprint("strings")\n}\nif(true == true){\nprint("booleans")\n}\n} $';
    }
    if (value == "String declaration") {
        document.getElementById("Input").value = '{string f = "hello world"}$';
    }
    if (value == "Int declaration") {
        document.getElementById("Input").value = '{int a = 3}$';
    }
    if (value == "Bool declaration") {
        document.getElementById("Input").value = '{boolean b = false}$';
    }
    if (value == "Multiple Programs") {
        document.getElementById("Input").value = '{}$ \n {{{{{{}}}}}}$ \n {{{{{{}}} /* comments are ignored */ }}}$ \n{ /* comments are still ignored */ int @}$';
    }
    if (value == "No Input Test case") {
        document.getElementById("Input").value = '';
    }
    if (value == "Unterminated String") {
        document.getElementById("Input").value = '"';
    }
    if (value == "Unterminated Comment") {
        document.getElementById("Input").value = '/* hello world';
    }
    if (value == "Unterminated String with invalid grammar") {
        document.getElementById("Input").value = '" THIS IS ALL UPPERCASE WHICH IS INVALID. ALSO its unterminated';
    }
}
//
function getType(id, scopeTree, node) {
    let type = id;
    if (/^[0-9]$/.test(type)) {
        return 'int';
    }
    else if (type == "false" || type == "true") {
        return 'boolean';
    }
    else if (type[0] == "'") {
        return 'string';
    }
    else if (type == "Equals To" || type == "Not Equals") {
        return 'boolean';
    }
    else if (type == "Addition Op") {
        return 'int';
    }
    else if (/^[a-z]$/.test(type)) {
        let currentNodde = scopeTree.currentNode;
        while (scopeTree.currentNode != scopeTree.root) {
            if (type in scopeTree.currentNode.scope) {
                scopeTree.currentNode.scope[type]['isUsed'] = true;
                scopeTree.currentNode = currentNodde;
                if (scopeTree.currentNode.scope[type]['isInitialized'] == false) {
                    if (arrayAlreadyHasArray(warnings, [node.line, node.character])) {
                    }
                    else {
                        output("DEBUG SEMANTIC - WARNING - Variable [" + type + "] is used before being initialized at " + node.line + "," + node.character);
                        warningCounter += 1;
                        warnings.push([type, node.line, node.character]);
                    }
                }
                let placeHolder = scopeTree.currentNode.scope[type]['type'];
                scopeTree.currentNode = currentNodde;
                return placeHolder;
            }
            if (scopeTree.currentNode.parent == null) {
                break;
            }
            scopeTree.currentNode = scopeTree.currentNode.parent;
        }
        if (type in scopeTree.currentNode.scope) {
            scopeTree.currentNode.scope[type]['isUsed'] = true;
            if (scopeTree.currentNode.scope[type]['isInitialized'] == false) {
                if (arrayAlreadyHasArray(warnings, [node.line, node.character])) {
                }
                else {
                    output("DEBUG SEMANTIC - WARNING - Variable [" + type + "] is used before being initialized at " + node.line + "," + node.character);
                    warningCounter += 1;
                    warnings.push([node.line, node.character]);
                }
            }
            let placeHolder = scopeTree.currentNode.scope[type]['type'];
            scopeTree.currentNode = currentNodde;
            return placeHolder;
        }
        else {
            scopeTree.currentNode = currentNodde;
            throw new Error("Variable [ " + type + "    ] isn't in scope at " + node.line + ',' + node.character);
        }
    }
}
//this is taken from https://betterprogramming.pub/check-if-an-array-is-within-a-2d-array-using-javascript-c534d96cb269 . 
//read up on it because array references can be annoying and are good to know.
function arrayAlreadyHasArray(arr, subarr) {
    for (var i = 0; i < arr.length; i++) {
        let checker = false;
        for (var j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === subarr[j]) {
                checker = true;
            }
            else {
                checker = false;
                break;
            }
        }
        if (checker) {
            return true;
        }
    }
    return false;
}
//this function is called from the scopeTree symbolTable function. Every variable in the scope tree gets added to the symbol table
function addToSymbolTable(key, values) {
    //child1 is the variable. i.e: a
    //throws warnings if the variable isnt used or initialized or both
    if (values['isUsed'] == false) {
        output("DEBUG SEMANTIC - WARNING - Variable [ " + key + " ] was declared at " + values['line'] + "," + values['char'] + ", but was never used.");
        warningCounter += 1;
    }
    if (values['isInitialized'] == false) {
        output("DEBUG SEMANTIC - WARNING - Variable [ " + key + " ] was declared at " + values['line'] + "," + values['char'] + ", but was never initialized.");
        warningCounter += 1;
    }
    else {
        if (values['isUsed'] == false) {
            output("DEBUG SEMANTIC - WARNING - Variable [ " + key + " ] was initialized at " + values['line'] + "," + values['char'] + ", but was never used.");
            warningCounter += 1;
        }
    }
    //this is how you dynamically append to a table.. first create a tableRow
    let tableRow = document.createElement("tr");
    //create new childs of the row
    let child = document.createElement("td");
    child.textContent = pgmCounter.toString();
    tableRow.appendChild(child);
    let child1 = document.createElement("td");
    child1.textContent = key;
    tableRow.appendChild(child1);
    //Child2 is the type
    let child2 = document.createElement("td");
    child2.textContent = values['type'];
    tableRow.appendChild(child2);
    //child3 is the scope
    let child3 = document.createElement("td");
    child3.textContent = values['scope'];
    tableRow.appendChild(child3);
    //child4 is the line
    //child6 is the "isUsed" attribute
    let child6 = document.createElement("td");
    child6.textContent = values['isUsed'];
    tableRow.appendChild(child6);
    //child7 is the "isInitialized attribute"
    let child7 = document.createElement("td");
    child7.textContent = values['isInitialized'];
    tableRow.appendChild(child7);
    let child4 = document.createElement("td");
    child4.textContent = values['line'];
    tableRow.appendChild(child4);
    //child5 is the position
    let child5 = document.createElement("td");
    child5.textContent = values['char'];
    tableRow.appendChild(child5);
    //append the table row with the children to the table
    document.getElementById("table").append(tableRow);
}
//Clears the output field 
function clearOutput() {
    document.getElementById("Output").value = "";
}
//Clears the input field
function clearInput() {
    document.getElementById("Input").value = "";
}
//Puts the parameter in the output textarea on the html page
function output(output) {
    document.getElementById("Output").value += output + '\n';
}
//# sourceMappingURL=Main.js.map