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
    c: { language: "c", version: "10.2.0" }
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
