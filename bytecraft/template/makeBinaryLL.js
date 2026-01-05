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

export async function makeBinaryLL(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

${userCode}

int main(){
    int n = ${testCase.n};
    struct Node* front = NULL;
    struct Node* rear = NULL;

    makeBinary(n, &front, &rear);

    struct Node* temp = front;
    while(temp != NULL) {
        printf("%d", temp->data);
        if(temp->next != NULL) printf(" ");
        struct Node* toFree = temp;
        temp = temp->next;
        free(toFree);
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(NULL) {}
};

${userCode}

int main(){
    int n = ${testCase.n};
    Node* front = NULL;
    Node* rear = NULL;

    makeBinary(n, front, rear);

    Node* temp = front;
    while(temp != NULL) {
        cout << temp->data;
        if(temp->next != NULL) cout << " ";
        temp = temp->next;
    }
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}

class Queue {
    Node front = null;
    Node rear = null;
}

public class Main {
    
    ${userCode}

    public static void main(String[] args) {
        int n = ${testCase.n};
        Queue q = new Queue();

        makeBinary(n, q);

        Node temp = q.front;
        while(temp != null) {
            System.out.print(temp.data);
            if(temp.next != null) System.out.print(" ");
            temp = temp.next;
        }
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

class Queue {
    constructor() {
        this.front = null;
        this.rear = null;
    }
}

${userCode}

const n = ${testCase.n};
const queue = new Queue();

makeBinary(n, queue);

let output = "";
let temp = queue.front;
while(temp !== null) {
    output += temp.data;
    if(temp.next !== null) output += " ";
    temp = temp.next;
}
console.log(output);
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