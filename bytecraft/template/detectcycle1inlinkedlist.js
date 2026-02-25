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
