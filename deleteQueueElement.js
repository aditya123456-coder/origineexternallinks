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

export async function deleteQueueElement(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>

int queue[100];
int front = -1;
int rear = -1;

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    int target = ${testCase.target};
    
    // Initialize Queue
    if(size > 0) {
        front = 0;
        rear = size - 1;
        for(int i=0; i<size; i++) {
            queue[i] = arr[i];
        }
    }

    deleteElement(target);

    // Print Queue
    if(front == -1 || front > rear) {
        // Empty
    } else {
        for(int i = front; i <= rear; i++) {
            printf("%d", queue[i]);
            if(i < rear) printf(" ");
        }
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
    int target = ${testCase.target};
    
    if(!arr.empty()) {
        front = 0;
        rear = arr.size() - 1;
        for(size_t i=0; i<arr.size(); i++) {
            queue[i] = arr[i];
        }
    }

    deleteElement(target);

    if(front != -1 && front <= rear) {
        for(int i = front; i <= rear; i++) {
            cout << queue[i];
            if(i < rear) cout << " ";
        }
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
        int target = ${testCase.target};
        
        if(arr.length > 0) {
            front = 0;
            rear = arr.length - 1;
            for(int i=0; i<arr.length; i++) {
                queue[i] = arr[i];
            }
        }

        deleteElement(target);

        if(front != -1 && front <= rear) {
            for(int i = front; i <= rear; i++) {
                System.out.print(queue[i]);
                if(i < rear) System.out.print(" ");
            }
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
const target = ${testCase.target};

if(arr.length > 0) {
    // JS arrays are dynamic, but let's respect the manual front/rear indices
    // We fill the array and set pointers
    queue = [...arr]; 
    front = 0;
    rear = arr.length - 1;
}

deleteElement(target);

let output = [];
if(front !== -1 && front <= rear) {
    for(let i = front; i <= rear; i++) {
        output.push(queue[i]);
    }
}
console.log(output.join(" "));
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