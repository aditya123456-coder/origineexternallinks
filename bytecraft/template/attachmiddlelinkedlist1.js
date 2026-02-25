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

export async function attachmiddlelinkedlist1(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    if (currentlang === "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

struct node{
    int data;
    struct node* next;
};

${userCode}

void insertatbegin(int val){
    struct node* newnode = (struct node*)malloc(sizeof(struct node));
    newnode->data = val;
    newnode->next = head;
    head = newnode;
}

void display(){
    struct node* temp = head;
    while(temp!=NULL){
        printf("%d ", temp->data);
        temp = temp->next;
    }
}

int main(){
    int arr[] = {${testCase.arr.join(",")}};
    int n = ${testCase.arr.length};
    int i;

    for(i=0;i<n;i++){
        insertatbegin(arr[i]);
    }

    int res = attachmiddle(${testCase.val}, ${testCase.target});
    if(res == -1){
        printf("-1");
        return 0;
    }

    display();
    return 0;
}`;
    }

    const response = await executeCode(fullcode, lang);

    return {
        passed: response.run.output.trim() === testCase.expected,
        output: response.run.output
    };
}
