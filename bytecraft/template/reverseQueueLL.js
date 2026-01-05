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