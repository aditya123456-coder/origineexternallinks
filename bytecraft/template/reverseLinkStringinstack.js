function executeCode(code, lang) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://emkc.org/api/v2/piston/execute",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                language: lang.language,
                version: lang.version,
                files: [{ content: code }]
            }),
            success: resolve,
            error: reject
        });
    });
}

const LANGUAGE_CONFIG = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "cpp", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    kotlin: { language: "kotlin", version: "1.8.0" },
    python: { language: "python", version: "3.11.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    php: { language: "php", version: "8.2.3" },
    ruby: { language: "ruby", version: "3.2.2" },
    rust: { language: "rust", version: "1.68.2" },
    go: { language: "go", version: "1.20.2" },
    csharp: { language: "csharp", version: "6.12.0" },
    swift: { language: "swift", version: "5.8.1" },
    bash: { language: "bash", version: "5.2.0" }
};

export async function reverseLinkStringinstack(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Helper to safely format string for injection
    const safeStr = testCase.str.replace(/"/g, '\\"');

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<string.h>

struct Node {
    char data;
    struct Node* next;
};

// Insert at begin to build stack/list
void insertBegin(struct Node** headRef, char newData) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = newData;
    newNode->next = *headRef;
    *headRef = newNode;
}

${userCode}

int main(){
    struct Node* head = NULL;
    char input[] = "${safeStr}";
    int len = strlen(input);
    
    // Build list to be: input[0] -> input[1] -> ...
    // We iterate backwards and insert at begin to achieve this order
    for(int i = len - 1; i >= 0; i--) {
        insertBegin(&head, input[i]);
    }

    char* result = reverseListToString(head);
    
    if(result == NULL) {
        printf(""); 
    } else {
        printf("%s", result);
        free(result); // Clean up user memory
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<string>
#include<vector>
using namespace std;

struct Node {
    char data;
    Node* next;
    Node(char c) : data(c), next(NULL) {}
};

void insertBegin(Node** headRef, char newData) {
    Node* newNode = new Node(newData);
    newNode->next = *headRef;
    *headRef = newNode;
}

${userCode}

int main(){
    Node* head = NULL;
    string input = "${safeStr}";
    
    for(int i = input.length() - 1; i >= 0; i--) {
        insertBegin(&head, input[i]);
    }

    cout << reverseListToString(head);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class Node {
    char data;
    Node next;
    Node(char d) { data = d; next = null; }
}

${userCode}

public class Main {
    public static Node insertBegin(Node head, char data) {
        Node newNode = new Node(data);
        newNode.next = head;
        return newNode;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        String input = "${safeStr}";
        Node head = null;
        
        for(int i = input.length() - 1; i >= 0; i--) {
            head = insertBegin(head, input.charAt(i));
        }

        System.out.print(sol.reverseListToString(head));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

function insertBegin(head, data) {
    let newNode = new Node(data);
    newNode.next = head;
    return newNode;
}

${userCode}

const input = "${safeStr}";
let head = null;

for(let i = input.length - 1; i >= 0; i--) {
    head = insertBegin(head, input[i]);
}

console.log(reverseListToString(head));
`;
    }

    const response = await executeCode(fullcode, lang);

    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    return {
        passed: response.run.output.trim() === testCase.expected,
        output: response.run.output
    };
}