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
    javascript: { language: "javascript", version: "18.15.0" }
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
