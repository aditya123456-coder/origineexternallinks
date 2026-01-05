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

export async function deleteQueueElementLL(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

struct Node *front = NULL;
struct Node *rear = NULL;

void enqueue(int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = NULL;
    if(rear == NULL) {
        front = rear = newNode;
    } else {
        rear->next = newNode;
        rear = newNode;
    }
}

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    int target = ${testCase.target};
    
    for(int i=0; i<size; i++) {
        enqueue(arr[i]);
    }

    deleteElement(target);

    struct Node* temp = front;
    while(temp != NULL) {
        printf("%d", temp->data);
        if(temp->next != NULL) printf(" ");
        temp = temp->next;
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

Node *front = NULL;
Node *rear = NULL;

void enqueue(int val) {
    Node* newNode = new Node(val);
    if(rear == NULL) {
        front = rear = newNode;
    } else {
        rear->next = newNode;
        rear = newNode;
    }
}

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    int target = ${testCase.target};
    
    for(int val : arr) {
        enqueue(val);
    }

    deleteElement(target);

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

public class Main {
    static Node front = null;
    static Node rear = null;

    static void enqueue(int val) {
        Node newNode = new Node(val);
        if(rear == null) {
            front = rear = newNode;
        } else {
            rear.next = newNode;
            rear = newNode;
        }
    }

    ${userCode}

    public static void main(String[] args) {
        int[] arr = {${arrString}};
        int target = ${testCase.target};
        
        for(int val : arr) {
            enqueue(val);
        }

        deleteElement(target);

        Node temp = front;
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

let front = null;
let rear = null;

function enqueue(val) {
    let newNode = new Node(val);
    if(rear === null) {
        front = rear = newNode;
    } else {
        rear.next = newNode;
        rear = newNode;
    }
}

${userCode}

const arr = [${arrString}];
const target = ${testCase.target};

arr.forEach(val => enqueue(val));

deleteElement(target);

let output = "";
let temp = front;
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