interface Message {
  type: 'print' | 'input' | 'clear' | 'append-last' | 'update-last';
}

interface PrintMessage {
  type: 'print';
  message: string;
  appendNewLine: boolean;
  replace: boolean;
}

interface InputMessage {
  type: 'input';
  message: string;
}

interface UpdateLastMessage {
  type: 'update-last';
  message: string;
}

interface AppendLastMessage {
  type: 'append-last';
  message: string;
}

interface UnityInstance {
  SendMessage(gameObject: string, functionName: string, value?: any);
}

function onUnityInstanceLoad(instance: UnityInstance) {
  globalThis.addEventListener('message', (event) => {
    const payload = event.data as Message;

    switch (payload.type) {
      case 'clear': {
        ('');
        instance.SendMessage('Canvas', 'OnClear');
        break;
      }
      case 'print': {
        const printPayload = payload as PrintMessage;

        if (printPayload.replace) {
          instance.SendMessage(
            'Canvas',
            'OnReplace',
            printPayload.message.replace(/\\n/g, '\n')
          );
        } else if (printPayload.appendNewLine) {
          instance.SendMessage(
            'Canvas',
            'OnMessage',
            printPayload.message.replace(/\\n/g, '\n')
          );
        } else {
          instance.SendMessage(
            'Canvas',
            'OnUpdate',
            printPayload.message.replace(/\\n/g, '\n')
          );
        }
        break;
      }
      case 'append-last': {
        const updateLastPayload = payload as UpdateLastMessage;
        instance.SendMessage(
          'Canvas',
          'OnUpdate',
          updateLastPayload.message.replace(/\\n/g, '\n')
        );
        break;
      }
      case 'update-last': {
        const appendLastPayload = payload as AppendLastMessage;
        instance.SendMessage(
          'Canvas',
          'OnRefresh',
          appendLastPayload.message.replace(/\\n/g, '\n')
        );
        break;
      }
      case 'input': {
        const inputPayload = payload as InputMessage;
        instance.SendMessage(
          'Canvas',
          'OnInput',
          inputPayload.message.replace(/\\n/g, '\n')
        );
        break;
      }
    }
  });
}

globalThis.onUnityInstanceLoad = onUnityInstanceLoad;
