let programCounter = 1;
function lexGreedyApproach(input) {
    let lineCounter = 1;
    let charCounter = 1;
    let inStringInvalidGrammar = false;
    let errorCounter = 0;
    let tokenStream = [];
    let inString = false;
    let currentCursor = 0;
    let secondCursor = 0;
    let stopSearchingSymbols = ['$', '}', "{", "=", "!", " ", "/"];
    let currentWord = "";
    let longestMatch = "";
    //This is the whole grammar in our language
    //I Implented this to make the tokens. 
    let grammar = {
        'print': ['print', 'Print Statement'], "int": ["int", 'varDecl'],
        "boolean": ["boolean", 'varDecl'], "}": ["}", "Right Curly"], "{": ["{", "Left Curly"], 'string': ["string", "varDecl"], '$': ['$', 'EOP'],
        "!=": ["!=", "Not Equals"], "(": ["(", "Left Paren"], ")": [")", "Right Paren"],
        "while": ["while", "While statement"], "if": ["if", "If Statement"], "+": ["+", "Addition Op"],
        "==": ["==", "Equals To"], "true": ["true", "Type Bool"], "false": ["false", "Type Bool"],
        0: ["0", "Type Num"], 1: ["1", "Type Num"], 2: ["2", "Type Num"], 3: ["3", "Type Num"],
        4: ["4", "Type Num"], 5: ["5", "Type Num"], 6: ["6", "Type Num"], 7: ["7", "Type Num"], 8: ["8", "Type Num"],
        9: ["9", "Type Num"], "=": ["=", "Assignment Op"], "a": ["a", "ID"], "b": ["b", "ID"], "c": ["c", "ID"], "d": ["d", "ID"],
        "e": ["e", "ID"], "f": ["f", "ID"], "g": ["g", "ID"], "h": ["h", "ID"], "i": ["i", "ID"], "j": ["j", "ID"],
        "k": ["k", "ID"], "l": ["l", "ID"], "m": ["m", "ID"], "n": ["n", "ID"], "o": ["o", "ID"], "p": ["p", "ID"],
        "q": ["q", "ID"], "r": ["r", "ID"], "s": ["s", "ID"], "t": ["t", "ID"], "u": ["u", "ID"], "v": ["w", "ID"], "w": ["w", "ID"],
        "x": ["x", "ID"], "y": ["y", "ID"], "z": ["z", "ID"]
    };
    output("INFO LEXER - Lexing program " + programCounter++);
    //This will put the dollar sign at the end of the progam if there isn't one. 
    if (input.slice(-1) != "$") {
        output("INFO LEXER - No $ at the end of the program. Adding One.");
        input = input + "$";
    }
    //The currentCursor increases everytime that the program finds the next longest word. 
    //Once it hits the $ or EOP, it will end the current program. At the end of the file, because there can be multiple programs, I self call this program 
    //with the next program by slicing the input from the last program ending to the end of the file
    while (input[currentCursor] != "$") {
        /*if(input[currentCursor] == "\n"){
            console.log("hello World ")
        }*/
        //Checks to see if there is a space at the current position. If there is a space, the progam will skip over it unless the progam is in a string.
        //I want to maintain the spaces in the strings so I skip over it.
        if (input[currentCursor] == " ") {
            if (!inString) {
                charCounter += 1;
                currentCursor += 1;
                continue;
            }
        }
        //This checks to see if the current cursor is a new line. 
        //If it's a new line, the counters go up and the char counter returns back to the beginning of the line
        if (input[currentCursor] == '\n') {
            if (inString) {
                output("ERROR LEXER - Unexpected character: New Line");
                errorCounter += 1;
            }
            charCounter = 1;
            lineCounter += 1;
            currentCursor += 1;
            continue;
        }
        //This checks to see if the current cursor is a forward slash followed by an asterisk meaning a comment block
        //It will loop through the comment until an asterisk followed by another forward slash is found.
        //If it was never found, the program will return an error stating the comment never ended or there is a dollar sign in the comment.
        //This isn't redundant because there will always be a $ at the end of the program. If the ending comment block isn't there, it will reach the dollar sign.
        //Boom
        if (input[currentCursor] == "/" && input[currentCursor + 1] == "*") {
            currentCursor += 2;
            charCounter += 2;
            while (input[currentCursor] != "*" && input[currentCursor + 1] != "/") {
                if (input[currentCursor] == '\n') {
                    charCounter = 1;
                    lineCounter += 1;
                }
                if (input[currentCursor] == "$") {
                    //once the dollar sign is found, the program spits out and error and the lexer fails.
                    output("ERROR LEXER - The Comment was never terminated or '$' was in the comment at line " + lineCounter + ", position: " + charCounter);
                    errorCounter += 1;
                    output("ERROR LEXER - Lex failed with " + errorCounter + " error(s)");
                    output("Not going to parse");
                    return false;
                }
                currentCursor += 1;
                charCounter += 1;
            }
            currentCursor += 2;
            charCounter += 2;
            secondCursor = currentCursor;
            continue;
        }
        //This is alot of stuff here because strings were the toughest part of the grammar.
        //One lined string outputs are really challenging to do. 
        //This checks to see if the current cursor is in a string. If it is, then it will loop through until the end of the string is found.
        //while it is looping through, it checks to see if each character is in the grammar
        if (inString) {
            if (input[currentCursor] == '"') {
                inString = false;
                //If there was an invalid character in the grammar, the program won't print the string because that's invalid
                if (!inStringInvalidGrammar) {
                    output("DEBUG LEXER - String " + "[ " + currentWord + " ] found at line: " + lineCounter + ", position: " + (charCounter - currentWord.length));
                }
                inStringInvalidGrammar = false;
                tokenStream.push([currentWord, "Type String", lineCounter, charCounter]);
                currentWord = "";
                currentCursor += 1;
                secondCursor = currentCursor;
                charCounter += 1;
                continue;
            }
            //This checks for Characters that aren't in the grammar and will continue to the next character if one is found 
            if (input[currentCursor].length == 1 && regex(input[currentCursor]) == false && input[currentCursor] != " " && input[currentCursor] != "" && input[currentCursor] != '\n') {
                output("ERROR LEXER - Unexpected character in the String - " + input[currentCursor] + " at line: " + lineCounter + ", position:" + charCounter);
                currentCursor += 1;
                inStringInvalidGrammar = true;
                currentWord = "";
                longestMatch = "";
                secondCursor = currentCursor;
                errorCounter += 1;
                charCounter += 1;
                continue;
            }
            if (/^[0-9]$/.test(input[currentCursor])) {
                output("ERROR LEXER - Unexpected character in the String - " + input[currentCursor] + " at line: " + lineCounter + ", position:" + charCounter);
                currentCursor += 1;
                inStringInvalidGrammar = true;
                currentWord = "";
                longestMatch = "";
                secondCursor = currentCursor;
                errorCounter += 1;
                charCounter += 1;
                continue;
            }
            charCounter += 1;
            currentWord += input[currentCursor];
            currentCursor += 1;
            secondCursor = currentCursor;
            continue;
        }
        //Checks to see if the current cursor is a double quotation indicating were now in a string. the inString flag is flipped to true. 
        if (input[currentCursor] == '"') {
            inString = true;
            currentCursor += 1;
            charCounter += 1;
            continue;
        }
        //This is the whole idea of the sliding window. This inputs the character at the second cursor.
        currentWord += input[secondCursor];
        //This will check if the program is either a != or == sign
        if ((input[currentCursor] == '!' && input[currentCursor + 1] == '=') || (input[currentCursor] == '=' && input[currentCursor + 1] == '=')) {
            if (input[currentCursor] == '!') {
                output("DEBUG LEXER - " + grammar["!="][1] + " [ != ] found at line: " + lineCounter + ", character: " + charCounter);
                let getToken = grammar["!="];
                getToken.push(lineCounter.toString());
                getToken.push(charCounter.toString());
                tokenStream.push(getToken);
            }
            else {
                output("DEBUG LEXER - " + grammar["=="][1] + " [ == ] found at line: " + lineCounter + ", character: " + charCounter);
                let getToken = grammar["=="].slice();
                getToken.push(lineCounter.toString());
                getToken.push(charCounter.toString());
                tokenStream.push(getToken);
            }
            currentCursor += 2;
            secondCursor = currentCursor;
            longestMatch = "";
            currentWord = "";
            charCounter += 2;
            continue;
        }
        //This checks if the current sliding window is in the grammar.
        if (regex(currentWord)) {
            longestMatch = currentWord;
        }
        else {
            //This checks for Characters that aren't in the grammar and will continue to the next character if one is found
            if (currentWord.length == 1 && regex(currentWord) == false && currentWord != " " && currentWord != "" && currentWord != '\n') {
                output("ERROR LEXER - Unexpected character:  " + currentWord);
                currentCursor += 1;
                currentWord = "";
                longestMatch = "";
                secondCursor = currentCursor;
                errorCounter += 1;
                charCounter += 1;
                continue;
            }
        }
        //increments second cursor or window
        secondCursor += 1;
        //Second cursor stops searching when it hits a symbol or a space.
        //if the second cursor of the input is a symbol we can stop searching at, this if statement will bve executed which will output the longest match.
        if (stopSearchingSymbols.includes(input[secondCursor])) {
            currentCursor += longestMatch.length;
            secondCursor = currentCursor;
            if (longestMatch != " " && longestMatch != '') {
                output("DEBUG LEXER - " + grammar[longestMatch][1] + " [ " + longestMatch + " ] found at line: " + lineCounter + ", position: " + charCounter);
                let newToken = grammar[longestMatch];
                if (newToken.length > 0) {
                    newToken = grammar[longestMatch];
                }
                newToken.push(lineCounter.toString());
                newToken.push(charCounter.toString());
                tokenStream.push([newToken[0], newToken[1], newToken[newToken.length - 2], newToken[newToken.length - 1]]);
            }
            charCounter += longestMatch.length;
            longestMatch = "";
            currentWord = "";
        }
    }
    output("DEBUG LEXER - " + grammar[input[currentCursor]][1] + " [ " + input[currentCursor] + " ] found at line: " + lineCounter + ", position: " + charCounter);
    let getToken = grammar[input[currentCursor]];
    getToken.push(lineCounter.toString());
    getToken.push(charCounter.toString());
    tokenStream.push(getToken);
    if (errorCounter > 0 || (errorCounter == 0 && inString)) {
        //This variable tells us there was an unterminated string 
        if (inString) {
            errorCounter += 1;
            output("ERROR LEXER - Unterminated String or '$' in String at line: " + lineCounter + ", position: " + charCounter);
        }
        output("ERROR LEXER - Lex failed with " + errorCounter + " error(s)");
        output("NOT GOING TO PARSE.");
        return false;
    }
    else {
        output("INFO LEXER - Lex Passed with 0 errors!!!");
    }
    output(" ");
    return tokenStream;
}
function resetPgmCounter() {
    programCounter = 1;
}
//The regex is used to check if characters and or words are valid in the language
function regex(test) {
    //The reasoning for the ^ and the $ is it checks the whole string to see if it matches.
    let num = /^[0-9]$/;
    let char = /^[a-z]$/;
    let symbol = /^}$|^{$|^==$|^=$|^!=$|^[(]$|^[)]$|^[+]$/;
    let keyword = /^string$|^int$|^boolean$|^char$|^while$|^print$|^if$|^true$|^false$/;
    //the regex test function checks if the pattern matches and returns true if it does
    if (char.test(test)) {
        return true;
    }
    if (num.test(test)) {
        return true;
    }
    if (symbol.test(test)) {
        return true;
    }
    if (keyword.test(test)) {
        return true;
    }
    return false;
}
//# sourceMappingURL=lexer.js.map