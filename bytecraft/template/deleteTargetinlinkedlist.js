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

export async function deleteTargetinlinkedlist(userCode, testCase, currentlang) {
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

// Helper to create list
struct Node* createList(int arr[], int size) {
    if (size == 0) return NULL;
    struct Node* head = NULL;
    struct Node* temp = NULL;
    for(int i=0; i<size; i++){
        struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
        newNode->data = arr[i];
        newNode->next = NULL;
        if(head == NULL) {
            head = newNode;
            temp = head;
        } else {
            temp->next = newNode;
            temp = temp->next;
        }
    }
    return head;
}

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    int target = ${testCase.target};
    struct Node* head = createList(arr, size);
    
    // Print return value (1 or -1)
    printf("%d", deleteTarget(head, target));
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

Node* createList(const vector<int>& arr) {
    if (arr.empty()) return NULL;
    Node* head = new Node(arr[0]);
    Node* temp = head;
    for(size_t i = 1; i < arr.size(); i++) {
        temp->next = new Node(arr[i]);
        temp = temp->next;
    }
    return head;
}

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    int target = ${testCase.target};
    Node* head = createList(arr);
    cout << deleteTarget(head, target);
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

${userCode}

public class Main {
    public static Node createList(int[] arr) {
        if (arr.length == 0) return null;
        Node head = new Node(arr[0]);
        Node temp = head;
        for (int i = 1; i < arr.length; i++) {
            temp.next = new Node(arr[i]);
            temp = temp.next;
        }
        return head;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr = {${arrString}};
        int target = ${testCase.target};
        Node head = createList(arr);
        System.out.print(sol.deleteTarget(head, target));
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

function createList(arr) {
    if (arr.length === 0) return null;
    let head = new Node(arr[0]);
    let temp = head;
    for (let i = 1; i < arr.length; i++) {
        temp.next = new Node(arr[i]);
        temp = temp.next;
    }
    return head;
}

${userCode}

const arr = [${arrString}];
const target = ${testCase.target};
const head = createList(arr);
console.log(deleteTarget(head, target));
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