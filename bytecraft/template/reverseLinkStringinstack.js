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

export async function reverseLinkStringinstack(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Helper to safely format string for injection
    const safeStr = testCase.str.replace(/"/g, '\\"');

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<string.h>

struct Node {
    char data;
    struct Node* next;
};

// Insert at begin to build stack/list
void insertBegin(struct Node** headRef, char newData) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = newData;
    newNode->next = *headRef;
    *headRef = newNode;
}

${userCode}

int main(){
    struct Node* head = NULL;
    char input[] = "${safeStr}";
    int len = strlen(input);
    
    // Build list to be: input[0] -> input[1] -> ...
    // We iterate backwards and insert at begin to achieve this order
    for(int i = len - 1; i >= 0; i--) {
        insertBegin(&head, input[i]);
    }

    char* result = reverseListToString(head);
    
    if(result == NULL) {
        printf(""); 
    } else {
        printf("%s", result);
        free(result); // Clean up user memory
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<string>
#include<vector>
using namespace std;

struct Node {
    char data;
    Node* next;
    Node(char c) : data(c), next(NULL) {}
};

void insertBegin(Node** headRef, char newData) {
    Node* newNode = new Node(newData);
    newNode->next = *headRef;
    *headRef = newNode;
}

${userCode}

int main(){
    Node* head = NULL;
    string input = "${safeStr}";
    
    for(int i = input.length() - 1; i >= 0; i--) {
        insertBegin(&head, input[i]);
    }

    cout << reverseListToString(head);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class Node {
    char data;
    Node next;
    Node(char d) { data = d; next = null; }
}

${userCode}

public class Main {
    public static Node insertBegin(Node head, char data) {
        Node newNode = new Node(data);
        newNode.next = head;
        return newNode;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        String input = "${safeStr}";
        Node head = null;
        
        for(int i = input.length() - 1; i >= 0; i--) {
            head = insertBegin(head, input.charAt(i));
        }

        System.out.print(sol.reverseListToString(head));
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

function insertBegin(head, data) {
    let newNode = new Node(data);
    newNode.next = head;
    return newNode;
}

${userCode}

const input = "${safeStr}";
let head = null;

for(let i = input.length - 1; i >= 0; i--) {
    head = insertBegin(head, input[i]);
}

console.log(reverseListToString(head));
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
