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

export async function searchpositioninlinkedlist1(userCode, testCase, currentlang) {
    const lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = "";

    if (currentlang === "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

int size = 0;

struct node{
    int data;
    struct node* next;
};

struct node* head = NULL;

void insertatbegin(int val){
    struct node* newnode = (struct node*)malloc(sizeof(struct node));
    newnode->data = val;
    newnode->next = head;
    head = newnode;
    size++;
}

${userCode}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.n};
    int target = ${testCase.target};

    for(int i=0;i<n;i++){
        insertatbegin(arr[i]);
    }

    printf("%d", search(target));
}`;
    }

    if (currentlang === "cpp") {
        fullcode = `#include<iostream>
using namespace std;

int size = 0;

struct node{
    int data;
    node* next;
};

node* head = NULL;

void insertatbegin(int val){
    node* newnode = new node();
    newnode->data = val;
    newnode->next = head;
    head = newnode;
    size++;
}

${userCode}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.n};
    int target = ${testCase.target};

    for(int i=0;i<n;i++){
        insertatbegin(arr[i]);
    }

    cout << search(target);
}`;
    }

    if (currentlang === "java") {
        fullcode = `class Main{

static int size = 0;

static class Node{
    int data;
    Node next;
}

static Node head = null;

static void insertatbegin(int val){
    Node newnode = new Node();
    newnode.data = val;
    newnode.next = head;
    head = newnode;
    size++;
}

${userCode}

public static void main(String[] args){
    int[] arr = {${testCase.arr.join(",")}};
    int n = ${testCase.n};
    int target = ${testCase.target};

    for(int i=0;i<n;i++){
        insertatbegin(arr[i]);
    }

    System.out.print(search(target));
}}`;
    }

    if (currentlang === "javascript") {
        fullcode = `
let size = 0;

class Node{
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

let head = null;

function insertatbegin(val){
    let newnode = new Node(val);
    newnode.next = head;
    head = newnode;
    size++;
}

${userCode}

let arr = [${testCase.arr.join(",")}];
let n = ${testCase.n};
let target = ${testCase.target};

for(let i=0;i<n;i++){
    insertatbegin(arr[i]);
}

console.log(search(target));
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output) === testCase.expected,
        output: response.run.output
    };
}

