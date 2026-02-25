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

export async function reverseQueueLL(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

int queue[100];
int front = -1;
int rear = -1;

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    
    // Fill Queue
    if(size > 0) {
        front = 0;
        rear = size - 1;
        for(int i=0; i<size; i++) {
            queue[i] = arr[i];
        }
    }

    struct Node* head = reverseQueue();

    // Print Linked List
    struct Node* temp = head;
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

int queue[100];
int front = -1;
int rear = -1;

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    
    if(!arr.empty()) {
        front = 0;
        rear = arr.size() - 1;
        for(size_t i=0; i<arr.size(); i++) {
            queue[i] = arr[i];
        }
    }

    Node* head = reverseQueue();

    Node* temp = head;
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

public class Main {
    static int[] queue = new int[100];
    static int front = -1;
    static int rear = -1;

    ${userCode}

    public static void main(String[] args) {
        int[] arr = {${arrString}};
        
        if(arr.length > 0) {
            front = 0;
            rear = arr.length - 1;
            for(int i=0; i<arr.length; i++) {
                queue[i] = arr[i];
            }
        }

        Node head = reverseQueue();

        Node temp = head;
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
let queue = [];
let front = -1;
let rear = -1;

${userCode}

const arr = [${arrString}];

if(arr.length > 0) {
    queue = [...arr];
    front = 0;
    rear = arr.length - 1;
}

const head = reverseQueue();

let output = "";
let temp = head;
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
