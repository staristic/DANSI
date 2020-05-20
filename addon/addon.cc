#include <v8.h>
#include <node.h>
#include <windows.h>
#include <winuser.h>
#include <stdio.h>
#include <string.h>

namespace demo {

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::NewStringType;
    using v8::Number;
    using v8::Object;
    using v8::String;
    using v8::Value;
    using v8::Array;
    using v8::Context;

    void WriteDataIntoClipBoardData(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = Context::New(isolate);
        v8::Local<v8::Array> data = v8::Local<v8::Array>::Cast(args[0]);
        int i = 0;
        int l = data->Length();
        char *Str = new char[l + 1];
        for(i = 0; i < l; i++ ){
            Str[i] = data->Get(context, i).ToLocalChecked()->NumberValue(context).FromMaybe(0);
        }
				Str[l] = '\0';
        if(OpenClipboard(NULL)){
            HGLOBAL  clipbuffer;
            char *buffer;
            EmptyClipboard();
            clipbuffer = GlobalAlloc(GMEM_MOVEABLE,  strlen(Str) + 1);
            buffer = (char*)GlobalLock(clipbuffer);
            strcpy(buffer, (LPCSTR)Str);
            GlobalUnlock(clipbuffer);
            SetClipboardData(CF_TEXT,clipbuffer);
            CloseClipboard();
        }
        delete [] Str;
        args.GetReturnValue().Set(String::NewFromUtf8(
            isolate, "", NewStringType::kNormal).ToLocalChecked());
        return;
    }

    void GetClipBoardData(const FunctionCallbackInfo<Value>& args) {
        char *buffer;
        int j, getl;
        Isolate* isolate = args.GetIsolate();
        v8::Local<v8::Context> context = Context::New(isolate);
        Local<Array> result_list = Array::New(isolate);
        if(OpenClipboard(NULL)){
            buffer = (char*)GetClipboardData(CF_TEXT);
            getl = strlen(buffer);
            for(j = 0; j < getl; j++ ){
                Local<Number> num = Number::New(isolate, buffer[j]);
                result_list->Set(context, j, num);
            }
            CloseClipboard();
        }
        args.GetReturnValue().Set(result_list);
        return;
    }

    void Initialize(Local<Object> exports) {
        NODE_SET_METHOD(exports, "writeDataIntoClipBoardData", WriteDataIntoClipBoardData);
        NODE_SET_METHOD(exports, "getClipBoardData", GetClipBoardData);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}