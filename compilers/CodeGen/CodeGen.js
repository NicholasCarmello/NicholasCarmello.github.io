let jumpTable = [];
let staticTable = [];
let tempCounter = 0;
let firstAssign = null;
let image = new Array(255);
let imageCounter = 0;
let staticStart = 0;
let offset = 0;
let whileStackmentCheck = [];
let newStatic = "";
let declaration;
let ifStatementCheck = [];
let EqualsCheck = [];
let jumpCounter = 0;
let scopeCounter = 0;
let heapCounter = 255;
let getTableEntry;
let assignmentTemp = [];
let ultParent = "";
let printTemp = 0;
let printEnd = "";
let additionStatementCheck = [];
let assignmentStatementCheck = [];
let newJumpTable = [];
let whileStorage = [];
let middleJump;
let whileTable = [];
let variableTemp = null;
let variableTemp2 = null;
let additonCounter = 0;
let equalsTemp = null;
let leftSide = null;
let rightSide = null;
let printStatement = [];
let ifStatementJump = 0;
let storeInstructions = [];
let booleans = [];
class CodeGen {
    astRoot;
    //Function to put static counter in the hex.. This is used for backpatching
    staticCounterToHex() {
        staticStart = imageCounter;
        newStatic = staticStart.toString(16);
        //Add 0 to the string if theres not 4 digits
        if (newStatic.length < 4) {
            newStatic = "0" + newStatic;
        }
        if (newStatic.length < 4) {
            newStatic = "0" + newStatic;
        }
        if (newStatic.length < 4) {
            newStatic = "0" + newStatic;
        }
        //Swap the positions of the (0 - 1) with (2-4)
        newStatic = newStatic.slice(2, 4) + newStatic.slice(0, 2);
    }
    populateImage() {
        //Initialize every position in the image to 0
        let counter = 256;
        for (var i = 0; i < counter; i++) {
            image[i] = "00";
        }
    }
    //Backpatch function
    backpatch() {
        //Go through the jump Table and backpatch
        for (var y = 0; y < newJumpTable.length; y++) {
            if (image.includes(newJumpTable[y][0])) {
                let index = image.indexOf(newJumpTable[y][0]);
                image[index] = newJumpTable[y][1];
                output("Back Patching " + newJumpTable[y][0] + " to " + newJumpTable[y][1]);
            }
        }
        //Go through the static table and backpatch
        for (var x = 0; x < staticTable.length; x++) {
            if (image.includes(staticTable[x][0])) {
                while (image.includes(staticTable[x][0])) {
                    let index = image.indexOf(staticTable[x][0]);
                    image[index] = newStatic.slice(0, 2);
                    image[index + 1] = newStatic.slice(2, 4);
                    output("Back Patching " + staticTable[x][0] + " to " + newStatic.slice(0, 2));
                }
                imageCounter += 1;
                this.staticCounterToHex();
            }
        }
    }
    //Put false and true into heap .. this happens before code gen starts
    initializeBooleansInHeap() {
        //initialize true and false
        let falseString = "false";
        let trueString = "true";
        image[heapCounter] = "00";
        heapCounter -= 1;
        output("Putting True and False into the heap ");
        //put true into heap
        for (var i = trueString.length - 1; i >= 0; i--) {
            image[heapCounter] = trueString[i].toString().charCodeAt(0).toString(16);
            heapCounter -= 1;
        }
        image[heapCounter] = "00";
        heapCounter -= 1;
        //put false into heap
        for (var i = falseString.length - 1; i >= 0; i--) {
            image[heapCounter] = falseString[i].toString().charCodeAt(0).toString(16);
            heapCounter -= 1;
        }
    }
    codeGeneration() {
        //I used the nodes character and line number as an indication that we already went down this branch
        //For example, if statements need an EC instruction
        //This function checks to see if that node.line and node.character aren't in the array
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
        //Function to get values out of the static table.
        function getValueOutOfStatic(node) {
            //check if its in firstScope
            for (var x = 0; x < staticTable.length; x++) {
                if (staticTable[x][1] == node && (staticTable[x][3] == scopeCounter)) {
                    return staticTable[x];
                }
            }
            let temp = scopeCounter;
            //Checks the other variables for the correct scope
            while (temp != 0) {
                temp -= 1;
                for (var x = 0; x < staticTable.length; x++) {
                    if (staticTable[x][1] == node && staticTable[x][3] == temp) {
                        return staticTable[x];
                    }
                }
            }
        }
        function generateIf(node) {
            //Case where its like if true or false, then put either a 00 or 01
            whileStorage.push(imageCounter);
            whileStorage.push(imageCounter);
            populateImage("A2");
            if (node.name == 'true') {
                populateImage("00");
            }
            else {
                populateImage("01");
            }
            populateImage("EC");
            //FF is always 00 so we can count on that
            populateImage("FF");
            populateImage("00");
        }
        function generateWhile(node) {
            //Case where its like if true or false, then put either a 00 or 01
            whileStorage.push(imageCounter);
            whileStorage.push(imageCounter);
            populateImage("A2");
            if (node.name == 'true') {
                populateImage("00");
            }
            else {
                populateImage("01");
            }
            populateImage("EC");
            //FF is always 00 so we can count on that
            populateImage("FF");
            populateImage("00");
        }
        function generateEquals(node) {
            if (node.parent.children[0].name == "Addition Op" || node.parent.children[1].name == "Addition Op") {
                equalsTemp = node.name;
                return;
            }
            let newNode = node.name.replace(/'/g, '');
            let temp = "";
            let temp2 = "";
            temp = node.parent.children[0];
            temp2 = node.parent.children[1];
            if (node.parent.parent.name == "Print") {
                if (/^[a-z]$/.test(node.name)) {
                    booleans = [];
                    throw new Error("variables inside a print bool expr are not available");
                }
                booleans.push(node.name);
                if (booleans.length == 2) {
                    if (booleans[0] == "true" || booleans[0] == "false") {
                        if (node.parent.name == "Equals To") {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("Fb");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                        else {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("Fb");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                    }
                    else if (/^[0-9]$/.test(booleans[0]) || /^[0-9]$/.test(booleans[1])) {
                        console.log("here");
                        if (node.parent.name == "Equals To") {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("FB");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                        else {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("Fb");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                    }
                    else if (booleans[0][0] == "'" || booleans[1][0] == "'") {
                        if (node.parent.name == "Equals To") {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("FB");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                        else {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("Fb");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                    }
                }
            }
            else if (node.parent.parent.name == "Assignment Statement") {
                if (/^[a-z]$/.test(node.name)) {
                    booleans = [];
                    throw new Error("variables inside an assignment bool expr are not available");
                }
                booleans.push(node.name);
                if (booleans.length == 2) {
                    if (booleans[0] == "true" || booleans[0] == "false") {
                        if (node.parent.name == "Equals To") {
                            let getTableEntry = getValueOutOfStatic(firstAssign);
                            if (booleans[0] == booleans[1]) {
                                populateImage("A9");
                                populateImage("Fb");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                            else {
                                populateImage("A9");
                                populateImage("F5");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                        }
                        else {
                            let getTableEntry = getValueOutOfStatic(firstAssign);
                            if (booleans[0] == booleans[1]) {
                                populateImage("A9");
                                populateImage("F5");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                            else {
                                populateImage("A9");
                                populateImage("FB");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                        }
                        firstAssign = null;
                    }
                    else if (/^[0-9]$/.test(booleans[0]) || /^[0-9]$/.test(booleans[1])) {
                        if (node.parent.name == "Equals To") {
                            let getTableEntry = getValueOutOfStatic(firstAssign);
                            if (booleans[0] == booleans[1]) {
                                populateImage("A9");
                                populateImage("FB");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                            else {
                                populateImage("A9");
                                populateImage("F5");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                        }
                        else {
                            let getTableEntry = getValueOutOfStatic(firstAssign);
                            if (booleans[0] == booleans[1]) {
                                populateImage("A9");
                                populateImage("F5");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                            else {
                                populateImage("A9");
                                populateImage("Fb");
                                populateImage("8D");
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                            }
                        }
                        firstAssign = null;
                    }
                    else if (booleans[0] == "'" || booleans[1] == "'") {
                        if (node.parent.name == "Equals To") {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A9");
                                populateImage("F5");
                            }
                            else {
                                populateImage("A9");
                                populateImage("Fb");
                            }
                        }
                        else {
                            if (booleans[0] == booleans[1]) {
                                populateImage("A0");
                                populateImage("F5");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                            else {
                                populateImage("A0");
                                populateImage("Fb");
                                populateImage("A2");
                                populateImage("02");
                                populateImage("FF");
                            }
                        }
                        firstAssign = null;
                    }
                }
            }
            //checks for assignment statement
            else if (node.parent.parent.name == "If Statement") {
                //Check if this if statement
                //Switch places of the nodes if in the wrong spot
                if (/^[a-z]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) {
                    if (node == node.parent.children[0]) {
                        node = temp2;
                    }
                    else {
                        node = temp;
                    }
                }
                //This checks to see if the if statement is already in the array. we prioritize the node.line and node.char attributes as unique identifiers
                //If its not in the array we will add the "AE" instruction because we can only use in the left side of the EC
                if (arrayAlreadyHasArray(ifStatementCheck, [node.parent.parent.character, node.parent.parent.line]) || (/^[a-z]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) ||
                    (/^[0-9]$/.test(node.parent.children[0].name) && /^[a-z]$/.test(node.parent.children[1].name)) || (/^[0-9]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name))) {
                }
                else {
                    populateImage("AE");
                    ifStatementCheck.push([node.parent.parent.character, node.parent.parent.line]);
                }
                //populate the image with the static value of the char
                if (/^[a-z]$/.test(node.name)) {
                    let getTableEntry = getValueOutOfStatic(node.name);
                    populateImage(getTableEntry[0]);
                    populateImage("XX");
                }
                //populate the image with digits when the current node is a digit.
                else if (/^[0-9]$/.test(node.name[0])) {
                    if (/^[0-9]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) {
                        if (node == node.parent.children[1]) {
                            populateImage("FF");
                            populateImage("00");
                        }
                        else {
                            populateImage("A2");
                            if (node.parent.children[0].name == node.parent.children[1].name) {
                                populateImage("00");
                            }
                            else {
                                populateImage("01");
                            }
                        }
                    }
                    else {
                        populateImage("A2");
                        populateImage("0" + node.name);
                    }
                }
                else if (node.name[0] == "'") {
                    if (checkEveryElementInArray(node.name)) {
                        let getIndex = checkEveryElementInArray(node.name, true);
                        console.log(getIndex);
                        populateImage((getIndex + 1).toString(16));
                        populateImage("00");
                    }
                    else {
                        populateHeap(node.name);
                        populateImage(heapCounter.toString(16));
                        populateImage("00");
                    }
                }
                else if (newNode == "true" || newNode == "false") {
                    if (node.name == "true") {
                        populateImage("F5");
                        populateImage("00");
                    }
                    else {
                        populateImage("FB");
                        populateImage("00");
                    }
                }
                if (arrayAlreadyHasArray(EqualsCheck, [node.parent.character, node.parent.line])) {
                }
                else {
                    populateImage("EC");
                    EqualsCheck.push([node.parent.character, node.parent.line]);
                }
            }
            //while statement
            else {
                whileStorage.push(node.name);
                whileStorage.push(imageCounter);
                //This switches the places of the nodes if there not in the correct order... saves some space
                if (/^[a-z]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) {
                    if (node == node.parent.children[0]) {
                        6;
                        node = temp2;
                    }
                    else {
                        node = temp;
                    }
                }
                //This checks to see if the while statement is already in the array.
                //If its not in the array we will add the "AE" instruction because we can only use in the left side of the EC
                if (arrayAlreadyHasArray(whileStackmentCheck, [node.parent.parent.character, node.parent.parent.line]) || (/^[a-z]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) ||
                    (/^[0-9]$/.test(node.parent.children[0].name) && /^[a-z]$/.test(node.parent.children[1].name)) || (/^[0-9]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name))) {
                }
                else {
                    populateImage("AE");
                    whileStackmentCheck.push([node.parent.parent.character, node.parent.parent.line]);
                }
                //populate image with the correct static value of the char
                if (/^[a-z]$/.test(node.name)) {
                    let getTableEntry = getValueOutOfStatic(node.name);
                    populateImage(getTableEntry[0]);
                    populateImage("XX");
                }
                //populate the image with numbers.
                else if (/^[0-9]$/.test(node.name[0])) {
                    if (/^[0-9]$/.test(node.parent.children[0].name) && /^[0-9]$/.test(node.parent.children[1].name)) {
                        if (node == node.parent.children[1]) {
                            populateImage("FF");
                            populateImage("00");
                        }
                        else {
                            populateImage("A2");
                            if (node.parent.children[0].name == node.parent.children[1].name) {
                                populateImage("00");
                            }
                            else {
                                populateImage("01");
                            }
                        }
                    }
                    else {
                        populateImage("A2");
                        populateImage("0" + node.name);
                    }
                }
                else if (node.name[0] == "'") {
                    //Deal with the operator
                    if (checkEveryElementInArray(node.name)) {
                        let getIndex = checkEveryElementInArray(node.name, true);
                        populateImage((getIndex - 1).toString(16));
                        populateImage("00");
                    }
                    else {
                        populateHeap(node.name);
                        populateImage(heapCounter.toString(16));
                        populateImage("00");
                    }
                }
                else if (newNode == "true" || newNode == "false") {
                    if (node.name == "true") {
                        populateImage("F5");
                        populateImage("00");
                    }
                    else {
                        populateImage("FB");
                        populateImage("00");
                    }
                }
                if (arrayAlreadyHasArray(EqualsCheck, [node.parent.character, node.parent.line])) {
                }
                else {
                    populateImage("EC");
                    EqualsCheck.push([node.parent.character, node.parent.line]);
                }
            }
        }
        function generatePrint(node) {
            //puts the correct instructions into the image for variable print statements
            if (/^[a-z]$/.test(node.name)) {
                populateImage("AC");
                let getTableEntry = getValueOutOfStatic(node.name);
                populateImage(getTableEntry[0]);
                populateImage("XX");
                populateImage("A2");
                if (getTableEntry[4] == "string" || getTableEntry[4] == "boolean") {
                    populateImage("02");
                }
                else {
                    populateImage("01");
                }
                populateImage("FF");
            }
            //Check if its an int
            else if (/^[0-9]$/.test(node.name[0])) {
                //puts the correct instructions into the image for integer print statements
                populateImage("A0");
                populateImage(node.name);
                populateImage("A2");
                populateImage("01");
                populateImage("FF");
            }
            else if (node.name[0] == "'") {
                //puts the correct instructions into the image for string print statements
                populateImage("A0");
                populateHeap(node.name);
                //put something here for strings
                populateImage((heapCounter + 1).toString(16));
                populateImage("A2");
                populateImage("02");
                populateImage("FF");
            }
            else if (node.name == "true" || node.name == "false") {
                //puts the correct instructions into the image for boolean print statements
                populateImage("A0");
                if (node.name == "true") {
                    populateImage("FA");
                }
                else {
                    populateImage("F5");
                }
                populateImage("A2");
                populateImage("02");
                populateImage("FF");
            }
        }
        function generateVarDecl(node) {
            if (node.name != "string" && node.name != 'int' && node.name != 'boolean') {
                if (declaration != "string" && declaration != "boolean") {
                    //puts the correct instructions into the image for int print statements
                    populateImage("A9");
                    populateImage("00");
                    populateImage("8D");
                    populateImage("T" + tempCounter);
                    populateImage("XX");
                    staticTable.push(['T' + tempCounter.toString(), node.name, offset, scopeCounter, declaration]);
                    offset += 1;
                    tempCounter += 1;
                }
                else {
                    //we skip booleans and strings and add them in at assignment
                    staticTable.push(['T' + tempCounter.toString(), node.name, offset, scopeCounter, declaration]);
                    tempCounter += 1;
                    offset += 1;
                }
            }
            else {
                declaration = node.name;
            }
        }
        function populateImage(instruction) {
            //Populates the image with the desired instruction.
            //The function first checks if there is anything in that spot in the image.
            //If there is something, then it's an error
            if (image[imageCounter] != "00") {
                throw new Error("Error");
            }
            else {
                output("DEBUG - Code Gen - Generateing " + instruction + " at position " + imageCounter);
            }
            image[imageCounter] = instruction;
            imageCounter += 1;
        }
        //populates heap with the desired instruction
        function populateHeap(node) {
            //First put the 00 before the string
            image[heapCounter] = "00";
            heapCounter -= 1;
            //put the string in the heap
            for (var i = node.length - 1; i > 0; i--) {
                if (node[i] != "'") {
                    image[heapCounter] = node[i].toString().charCodeAt(0).toString(16);
                    heapCounter -= 1;
                }
            }
        }
        //function to populate the image with addition operator
        function generateAddition(node) {
            if (firstAssign != null) {
                if (/^[a-z]$/.test(node.name)) {
                    //This is the condition when there is an addition operator in an assignment statement
                    assignmentTemp.push("6D");
                    let getTableEntry = getValueOutOfStatic(node.name);
                    assignmentTemp.push(getTableEntry[0]);
                    assignmentTemp.push("00");
                    assignmentTemp.push("8D");
                    let newGetTableEntry = getValueOutOfStatic(firstAssign);
                    console.log(newGetTableEntry);
                    assignmentTemp.push(newGetTableEntry[0]);
                    assignmentTemp.push("00");
                }
                else {
                    //This is for when addition ops have numbers
                    additonCounter += parseInt(node.name);
                }
            }
            //When there is an addition op in a print statement
            else if (ultParent == "Print") {
                if (/^[a-z]$/.test(node.name)) {
                    printEnd += node.name;
                }
                else {
                    printTemp += parseInt(node.name);
                }
            }
            //When there is an addition op in the bool expr
            else if (ultParent == "If statement" || ultParent == "While") {
                if (/^[a-z]$/.test(node.name)) {
                    if (variableTemp == null) {
                        variableTemp = node.name;
                    }
                    else {
                        variableTemp2 = node.name;
                    }
                }
                else {
                    let findside = node;
                    //This finds which side the numbers are on
                    while (findside.parent.name != "Not Equals" && findside.parent.name != "Equals To") {
                        findside = findside.parent;
                    }
                    //left side is the left side of expr
                    if (findside == findside.parent.children[0]) {
                        leftSide += parseInt(node.name);
                    }
                    //Right side is the right side of the expr
                    else {
                        rightSide += parseInt(node.name);
                    }
                    whileStorage.push(imageCounter);
                    additonCounter += parseInt(node.name);
                }
            }
        }
        //For String comparisons. This checks to see if there is already the same type of string in heap.
        //This saves some space in the long run.
        function checkEveryElementInArray(node, bool = false) {
            node = node.replace(/'/g, '');
            let index = node.length - 1;
            let newIndex;
            for (var i = 255; i >= heapCounter; i--) {
                if (String.fromCharCode(parseInt(image[i], 16)).localeCompare(node[index]) == 0) {
                    index -= 1;
                    if (index < 0) {
                        if (bool == true) {
                            newIndex = i;
                            i = 0;
                        }
                        else {
                            return true;
                        }
                    }
                }
                else {
                    index = node.length - 1;
                }
            }
            if (bool == true) {
                return newIndex;
            }
            return false;
        }
        function generateAssignment(node) {
            if (firstAssign == null) {
                firstAssign = node.name;
            }
            else {
                if (/^[a-z]$/.test(node.name)) {
                    //right side of assignment is a variable
                    //have to look it up
                    populateImage("AD");
                    let getTableEntry = getValueOutOfStatic(node.name);
                    populateImage(getTableEntry[0]);
                    populateImage("XX");
                    populateImage("8D");
                    getTableEntry = getValueOutOfStatic(firstAssign);
                    populateImage(getTableEntry[0]);
                    populateImage("XX");
                }
                else {
                    //this side of the assigment is a string,int or boolean
                    let getTableEntry = getValueOutOfStatic(firstAssign);
                    if (getTableEntry[4] == "string" || getTableEntry[4] == "boolean") {
                        if (getTableEntry[4] == "string" && checkEveryElementInArray(node.name)) {
                        }
                        else {
                            populateHeap(node.name);
                        }
                        populateImage("A9");
                        if (getTableEntry[4] == "string") {
                            populateImage((heapCounter + 1).toString(16));
                        }
                        else if (node.name == "true") {
                            //Put true into the image
                            populateImage("FB");
                        }
                        else {
                            //put false into the image
                            populateImage("F5");
                            image[imageCounter] = "F5";
                        }
                        populateImage("8D");
                        getTableEntry = getValueOutOfStatic(firstAssign);
                        populateImage(getTableEntry[0]);
                        populateImage("XX");
                    }
                    else {
                        //put the number in the accumulator
                        populateImage("A9");
                        populateImage("0" + node.name.toString());
                        populateImage("8D");
                        getTableEntry = getValueOutOfStatic(firstAssign);
                        populateImage(getTableEntry[0]);
                        populateImage("XX");
                    }
                }
                firstAssign = null;
            }
        }
        let currentParent;
        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth) {
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0) {
                // ... note the leaf node.
                if (node.parent.name == "VarDecl") {
                    //call varDecl function
                    generateVarDecl(node);
                }
                else if (node.parent.name == "Assignment Statement") {
                    //call assignment function
                    generateAssignment(node);
                }
                else if (node.parent.name == "Print") {
                    //call print function
                    generatePrint(node);
                }
                else if (node.parent.name == "If Statement") {
                    //If there is ever something in the child of an if statement.. it's going to be one thing .. true or false
                    generateIf(node);
                }
                else if (node.parent.name == "While Statement") {
                    generateWhile(node);
                }
                else if (node.parent.name == "Equals To" || node.parent.name == "Not Equals") {
                    //call Equals function function
                    generateEquals(node);
                }
                else if (node.parent.name == "Addition Op") {
                    //call addition Op function
                    generateAddition(node);
                }
            }
            else {
                // There are children, so note these interior/branch nodes and ...
                // .. recursively expand them.
                currentParent = node.name;
                for (var i = 0; i < node.children.length; i++) {
                    if (node.name == "If Statement" && node.children[i].name == "Block") {
                        ultParent = "";
                        if (node.children[0].name != "true" && node.children[0].name != "false") {
                            if ((node.children[0].children[0].name != "Addition Op" && node.children[0].children[1].name == "Addition Op") || (node.children[0].children[0].name == "Addition Op" && node.children[0].children[1].name != "Addition Op")) {
                                //This is for addition operators in the boolean expr of an if statement
                                populateImage("A9");
                                populateImage(additonCounter);
                                if (variableTemp != null) {
                                    console.log(variableTemp);
                                    populateImage("6D");
                                    let tableEntry = getValueOutOfStatic(variableTemp);
                                    populateImage(tableEntry[0]);
                                    populateImage("00");
                                }
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                                if (/^[0-9]$/.test(equalsTemp)) {
                                    populateImage("A2");
                                    populateImage(equalsTemp);
                                }
                                else {
                                    let tableEntry = getValueOutOfStatic(equalsTemp);
                                    populateImage("AE");
                                    populateImage(tableEntry[0]);
                                    populateImage("00");
                                }
                                //Reset the placeholders for variables in the image
                                populateImage("EC");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A9");
                                populateImage("00");
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                            }
                            else if (node.children[0].children[0].name == "Addition Op" && node.children[0].children[1].name == "Addition Op") {
                                //This is for addition operators in the boolean expr of an if statement
                                populateImage("A9");
                                populateImage(leftSide);
                                populateImage("8D");
                                let getTableEntry = getValueOutOfStatic(variableTemp);
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A2");
                                populateImage(rightSide);
                                populateImage("EC");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A9");
                                populateImage("00");
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                            }
                        }
                        rightSide = null;
                        leftSide = null;
                        additonCounter = null;
                        equalsTemp = null;
                        variableTemp = null;
                        scopeCounter += 1;
                        //This checks if the bool expr is a not equals sign
                        //We need another jump for not equals sign
                        if (node.children[0].name != "Not Equals") {
                            populateImage("D0");
                            image[imageCounter] = "J" + jumpCounter;
                            jumpTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                        }
                        else {
                            //If there is an equals sign we will go down this path and populate the image
                            populateImage("D0");
                            image[imageCounter] = "J" + jumpCounter;
                            jumpTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                            populateImage("A2");
                            populateImage("01");
                            populateImage("EC");
                            populateImage("FF");
                            populateImage("00");
                            populateImage("D0");
                            ifStatementJump = imageCounter;
                            image[imageCounter] = "J" + jumpCounter;
                            jumpTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                        }
                        expand(node.children[i], depth + 1);
                        scopeCounter -= 1;
                    }
                    else if (node.name == "While Statement" && node.children[i].name == "Block") {
                        ultParent = "";
                        //This is for addition operators in the boolean expr of an while statement
                        console.log(node.children[0]);
                        if (node.children[0].name != "false" && node.children[0].name != "true") {
                            if ((node.children[0].children[0].name != "Addition Op" && node.children[0].children[1].name == "Addition Op") || (node.children[0].children[0].name == "Addition Op" && node.children[0].children[1].name != "Addition Op")) {
                                whileStorage.push(imageCounter);
                                populateImage("A9");
                                populateImage(additonCounter);
                                if (variableTemp != null) {
                                    populateImage("6D");
                                    let tableEntry = getValueOutOfStatic(variableTemp);
                                    populateImage(tableEntry[0]);
                                    populateImage("00");
                                }
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                                //Test if the equalsTemp is a number
                                if (/^[0-9]$/.test(equalsTemp)) {
                                    populateImage("A2");
                                    populateImage(equalsTemp);
                                }
                                else {
                                    //else its a character so we have to fetch it out of the static table.
                                    let tableEntry = getValueOutOfStatic(equalsTemp);
                                    populateImage("AE");
                                    populateImage(tableEntry[0]);
                                    populateImage("00");
                                }
                                populateImage("EC");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A9");
                                populateImage("00");
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                            }
                            else if (node.children[0].children[0].name == "Addition Op" && node.children[0].children[1].name == "Addition Op") {
                                whileStorage.push(imageCounter);
                                //This is for the times when the additions ops are on both sides of the expr
                                populateImage("A9");
                                populateImage(leftSide.toString());
                                //This will add the variable if there is one on in the addition op
                                if (variableTemp != null) {
                                    populateImage("6D");
                                    let getTableEntry = getValueOutOfStatic(variableTemp);
                                    populateImage(getTableEntry[0]);
                                    populateImage("00");
                                    variableTemp = null;
                                }
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                                //This will add the variable if there is one in the addition op
                                if (variableTemp2 != null) {
                                    populateImage("A9");
                                    populateImage(rightSide);
                                    let getTableEntry = getValueOutOfStatic(variableTemp2);
                                    populateImage("6D");
                                    populateImage(getTableEntry[0]);
                                    populateImage("00");
                                    populateImage("8D");
                                    populateImage("00");
                                    populateImage("00");
                                    variableTemp2 = null;
                                    populateImage("AE");
                                    populateImage("00");
                                    populateImage("00");
                                    populateImage("EC");
                                    populateImage("FF");
                                    populateImage("00");
                                }
                                else {
                                    populateImage("A2");
                                    populateImage(rightSide);
                                    populateImage("EC");
                                    populateImage("FF");
                                    populateImage("00");
                                }
                                //Reset the memory addresses that we just used for the addition statements
                                populateImage("A9");
                                populateImage("00");
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A9");
                                populateImage("00");
                                populateImage("8D");
                                populateImage("00");
                                populateImage("00");
                            }
                        }
                        //Reset variables
                        rightSide = null;
                        leftSide = null;
                        additonCounter = null;
                        equalsTemp = null;
                        scopeCounter += 1;
                        //Not equal statements use another jump in there instruction sequence
                        if (node.children[0].name != "Not Equals") {
                            populateImage("D0");
                            image[imageCounter] = "J" + jumpCounter;
                            whileTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                        }
                        //Treat the while statements as a not equals sign
                        else {
                            populateImage("D0");
                            image[imageCounter] = "J" + jumpCounter;
                            whileTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                            populateImage("A2");
                            populateImage("01");
                            populateImage("EC");
                            populateImage("FF");
                            populateImage("00");
                            populateImage("D0");
                            middleJump = imageCounter;
                            image[imageCounter] = "J" + jumpCounter;
                            whileTable.push(["J" + jumpCounter, imageCounter]);
                            jumpCounter += 1;
                            imageCounter += 1;
                        }
                        expand(node.children[i], depth + 1);
                        scopeCounter -= 1;
                    }
                    //increase scope and decrease scope
                    //We need this for looking up variables in the static table
                    else if (node.children[i].name == "Block") {
                        scopeCounter += 1;
                        expand(node.children[i], depth + 1);
                        scopeCounter -= 1;
                    }
                    //The print statement is interesting because it can be literally anything.
                    //Here we deal with the addition op
                    else if (node.children[i].name == "Print") {
                        ultParent = "Print";
                        expand(node.children[i], depth + 1);
                        booleans = [];
                        //Print temp holds our number in the addition op
                        if (printTemp != 0) {
                            //print end holds our variable if there is one in the addition op
                            if (printEnd != "") {
                                populateImage("A9");
                                populateImage(printTemp.toString(16));
                                populateImage("6D");
                                let getTableEntry = getValueOutOfStatic(printEnd);
                                populateImage(getTableEntry[0]);
                                populateImage("00");
                                populateImage("8D");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("AC");
                                populateImage("FF");
                                populateImage("00");
                                populateImage("A2");
                                populateImage("01");
                                populateImage("FF");
                            }
                            //no variable so we populate the rest of the print statement
                            else {
                                populateImage("A0");
                                populateImage(printTemp.toString(16));
                                populateImage("A2");
                                populateImage("01");
                                populateImage("FF");
                            }
                        }
                        //reset FF
                        populateImage("A9");
                        populateImage("00");
                        populateImage("8D");
                        populateImage("FF");
                        populateImage("00");
                        //reset variables
                        printEnd = "";
                        printTemp = 0;
                        ultParent = "";
                    }
                    else if (node.children[i].name == "Assignment Statement") {
                        expand(node.children[i], depth + 1);
                        booleans = [];
                        //This is for the cases when the addition operater is an addition op on the right side
                        if (firstAssign != null) {
                            populateImage("A9");
                            populateImage(additonCounter);
                            for (var x = 0; x < assignmentTemp.length; x++) {
                                populateImage(assignmentTemp[x]);
                            }
                            //reset counters
                            firstAssign = null;
                            additonCounter = 0;
                            assignmentTemp = [];
                        }
                    }
                    else if (node.children[i].name == "If Statement") {
                        ultParent = "If statement";
                        expand(node.children[i], depth + 1);
                        //Update the indexes of the jump table. this will be used to fill in the jumps later with backpatching
                        jumpTable[jumpTable.length - 1][1] = (imageCounter - jumpTable[jumpTable.length - 1][1] - 1).toString(16);
                        newJumpTable.push(jumpTable.pop());
                        //Not equals has another jump in it. We will also update that index.
                        if (node.children[i].children[0].name == "Not Equals") {
                            jumpTable[jumpTable.length - 1][1] = (ifStatementJump - jumpTable[jumpTable.length - 1][1]).toString(16);
                            //pop the statement off the stack
                            newJumpTable.push(jumpTable.pop());
                            ifStatementJump = 0;
                        }
                    }
                    else if (node.children[i].name == "While Statement") {
                        ultParent = "While";
                        expand(node.children[i], depth + 1);
                        //These instructions are used for comparing not equals and equals
                        populateImage("A2");
                        populateImage("01");
                        populateImage("EC");
                        populateImage("FF");
                        populateImage("00");
                        populateImage("D0");
                        //imageCounter
                        image[imageCounter] = "J" + jumpCounter;
                        whileTable.push(['J' + jumpCounter, imageCounter]);
                        jumpCounter += 1;
                        imageCounter += 1;
                        console.log(node.children[i].children[0]);
                        if (node.children[i].children[0].name != "false" && node.children[i].children[0].name != "true") {
                            if (node.children[i].children[0].children[0].name == "Addition Op" && node.children[i].children[0].children[1].name == "Addition Op") {
                                //update the while table jump
                                whileTable[whileTable.length - 1][1] = (256 - imageCounter + parseInt(whileStorage[whileStorage.length - 1])).toString(16);
                            }
                            else {
                                //update the while table jump
                                whileTable[whileTable.length - 1][1] = (256 - imageCounter + parseInt(whileStorage[1])).toString(16);
                            }
                        }
                        else {
                            whileTable[whileTable.length - 1][1] = (256 - imageCounter + parseInt(whileStorage[1])).toString(16);
                        }
                        newJumpTable.push(whileTable.pop());
                        //update the while table jump
                        whileTable[whileTable.length - 1][1] = (imageCounter - parseInt(whileTable[whileTable.length - 1][1]) - 1).toString(16);
                        newJumpTable.push(whileTable.pop());
                        if (node.children[i].children[0].name == "Not Equals") {
                            //update the while table jump if there is an extra jump for the not equals op
                            whileTable[whileTable.length - 1][1] = (middleJump - parseInt(whileTable[whileTable.length - 1][1])).toString(16);
                            newJumpTable.push(whileTable.pop());
                            middleJump = 0;
                        }
                        //reset the storage of imageCounters;
                        whileStorage = [];
                    }
                    else {
                        expand(node.children[i], depth + 1);
                    }
                }
            }
        }
        // Make the initial call to expand from the root.
        expand(this.astRoot, 0);
        populateImage("00");
        // Return the result.
    }
    ;
}
//# sourceMappingURL=CodeGen.js.map