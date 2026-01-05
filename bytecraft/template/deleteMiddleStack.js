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

export async function deleteMiddleStack(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Format array for injection
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

struct Node* top = NULL;

void push(int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = top;
    top = newNode;
}

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    
    // We push in order so the last element of array becomes Top? 
    // Or iterate normally? 
    // Let's assume input array is [bottom, ..., top].
    // So iterating 0 to size-1 and pushing makes arr[size-1] the TOP.
    // However, typical test cases often list [Top, Next, ...].
    // Let's standardize: If Input is [10, 20, 30] and we want 10 to be top,
    // we must push 30, then 20, then 10.
    // So we iterate backwards.
    
    for(int i = size - 1; i >= 0; i--) {
        push(arr[i]);
    }

    printf("%d", deleteMiddle());
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

Node* top = NULL;

void push(int val) {
    Node* newNode = new Node(val);
    newNode->next = top;
    top = newNode;
}

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    
    // Push backwards to ensure arr[0] is at the TOP
    for(int i = arr.size() - 1; i >= 0; i--) {
        push(arr[i]);
    }

    cout << deleteMiddle();
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

public class Main {
    static Node top = null;

    static void push(int val) {
        Node newNode = new Node(val);
        newNode.next = top;
        top = newNode;
    }

    ${userCode}

    public static void main(String[] args) {
        int[] arr = {${arrString}};
        
        for(int i = arr.length - 1; i >= 0; i--) {
            push(arr[i]);
        }

        System.out.print(deleteMiddle());
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

let top = null;

function push(val) {
    let newNode = new Node(val);
    newNode.next = top;
    top = newNode;
}

${userCode}

const arr = [${arrString}];

// Push backwards so arr[0] is TOP
for(let i = arr.length - 1; i >= 0; i--) {
    push(arr[i]);
}

console.log(deleteMiddle());
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
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}