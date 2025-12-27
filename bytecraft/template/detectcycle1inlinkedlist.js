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

export async function detectcycle1inlinkedlist(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    // ✅ C
    if (currentlang === "c") {
        fullcode = `#include <stdio.h>
#include <stdlib.h>

struct node{
    int data;
    struct node* next;
};

${userCode}

int main(){
    struct node* head = NULL;
    struct node* n1 = (struct node*)malloc(sizeof(struct node));
    struct node* n2 = (struct node*)malloc(sizeof(struct node));
    struct node* n3 = (struct node*)malloc(sizeof(struct node));

    n1->data = 1; n2->data = 2; n3->data = 3;
    n1->next = n2;
    n2->next = n3;

    if(${testCase.cycle}){
        n3->next = n1; // create cycle
    } else {
        n3->next = NULL;
    }

    head = n1;
    printf("%d", hasCycle(head));
    return 0;
}`;
    }

    // ✅ C++
    if (currentlang === "cpp") {
        fullcode = `#include <bits/stdc++.h>
using namespace std;

struct node{
    int data;
    node* next;
};

${userCode}

int main(){
    node* n1 = new node{1, NULL};
    node* n2 = new node{2, NULL};
    node* n3 = new node{3, NULL};

    n1->next = n2;
    n2->next = n3;

    if(${testCase.cycle}){
        n3->next = n1;
    }

    cout << hasCycle(n1);
    return 0;
}`;
    }

    // ✅ Java
    if (currentlang === "java") {
        fullcode = `class Node {
    int data;
    Node next;
    Node(int d){ data = d; next = null; }
}

class Main {
${userCode}

    public static void main(String[] args){
        Node n1 = new Node(1);
        Node n2 = new Node(2);
        Node n3 = new Node(3);

        n1.next = n2;
        n2.next = n3;

        if(${testCase.cycle}){
            n3.next = n1;
        }

        System.out.print(hasCycle(n1));
    }
}`;
    }

    // ✅ JavaScript
    if (currentlang === "javascript") {
        fullcode = `
class Node {
    constructor(data){
        this.data = data;
        this.next = null;
    }
}

${userCode}

let n1 = new Node(1);
let n2 = new Node(2);
let n3 = new Node(3);

n1.next = n2;
n2.next = n3;

if(${testCase.cycle}){
    n3.next = n1;
}

console.log(hasCycle(n1));
`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}
