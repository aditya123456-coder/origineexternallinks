function executeCode(code, lang) {
    return new Promise((resolve, reject) => {

        $.ajax({
            url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                source_code: code,
                language_id: lang.language_id,
                stdin: "",
                cpu_time_limit: 5,
                memory_limit: 128000
            }),
            success: function (response) {

                // Convert Judge0 response → Piston-like structure
                resolve({
                    run: {
                        stdout: response.stdout || "",
                        stderr: response.stderr || response.compile_output || "",
                        output:
                            (response.stdout || "") +
                            (response.stderr || "") +
                            (response.compile_output || ""),
                        code: response.status?.id || 0,
                        signal: response.status?.description || null
                    }
                });

            },
            error: function (xhr) {
                reject({
                    run: {
                        stdout: "",
                        stderr: xhr.responseText || "Execution failed",
                        output: xhr.responseText || "Execution failed",
                        code: -1,
                        signal: null
                    }
                });
            }
        });

    });
}


const LANGUAGE_CONFIG = {
    c: { language_id: 50 },
    cpp: { language_id: 54 },
    java: { language_id: 62 },
    kotlin: { language_id: 78 },
    python: { language_id: 71 },
    javascript: { language_id: 63 },
    typescript: { language_id: 74 },
    php: { language_id: 68 },
    ruby: { language_id: 72 },
    rust: { language_id: 73 },
    go: { language_id: 60 },
    csharp: { language_id: 51 },
    swift: { language_id: 83 },
    bash: { language_id: 46 }
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
