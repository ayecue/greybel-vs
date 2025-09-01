import { randomString } from '../../helper/random-string';

const SHORTEST_NAME = 'dddd' as const;

export const generateAutoCompileCode = (
  rootFilePath: string,
  importPaths: string[],
  allowImport: boolean
): string => {
  return `
      tryGetFile = function(pc, path, maxTries = 20)
        handle = File(pc, path)
        tries = 0
        while (handle == null)
          if (tries > maxTries) then
            break
          end if
          handle = File(pc, path)
          tries = tries + 1
          print("Failed to get file """ + path + """. (" + tries + "/" + maxTries + " tries)")
          wait(0.1)
        end while
        return handle
      end function

      rootFilePath = "${rootFilePath}"
      filePaths = [${importPaths.map((it) => `"${it}"`).join(',')}]
      tmpDirectory = "${randomString(5)}"
      myShell = get_shell
      myComputer = host_computer(myShell)

      srcFile = tryGetFile(myComputer, BUILD_RESOURCE_DESTINATION + rootFilePath)
      if srcFile == null then exit("EXIT_CODE=1;EXIT_MESSAGE=Couldn't find source file in " + BUILD_RESOURCE_DESTINATION + rootFilePath + ";")

      fileName = name(srcFile)
      binaryName = replace_regex(fileName, "\\.[^.]+$", "")
      destination = parent_path(path(srcFile))

      result = create_folder(myComputer, destination, tmpDirectory)
      if result != 1 then exit("EXIT_CODE=1;EXIT_MESSAGE=Error when creating temporary build folder! Reason: " + result + ";")

      tmpFolder = tryGetFile(myComputer, destination + "/" + tmpDirectory)
      if tmpFolder == null then exit("EXIT_CODE=1;EXIT_MESSAGE=Couldn't find temporary build folder in " + destination + "/" + tmpDirectory + ";")

      result = copy(srcFile, tmpFolder.path, "${SHORTEST_NAME}.src")
      if result != 1 then exit("EXIT_CODE=1;EXIT_MESSAGE=Error when moving source file into temporary build folder! Reason: " + result + ";")

      tmpFile = tryGetFile(myComputer, tmpFolder.path + "/${SHORTEST_NAME}.src")
      if (tmpFile == null) then exit("EXIT_CODE=1;EXIT_MESSAGE=Cannot find temporary file!;")

      result = build(myShell, tmpFolder.path + "/${SHORTEST_NAME}.src", tmpFolder.path, ${
        allowImport ? 1 : 0
      })

      if result != "" then exit("EXIT_CODE=1;EXIT_MESSAGE=Error when building! Reason: " + result + ";")

      binaryFile = tryGetFile(myComputer, tmpFolder.path + "/${SHORTEST_NAME}")
      if binaryFile == null then exit("EXIT_CODE=1;EXIT_MESSAGE=Couldn't find binary file in " + tmpFolder.path + "/${SHORTEST_NAME};")

      result = move(binaryFile, BUILD_DESTINATION, binaryName)
      if result != 1 then exit("EXIT_CODE=1;EXIT_MESSAGE=Error when moving binary file into destination folder! Reason: " + result + ";")
      delete(File(myComputer, BUILD_RESOURCE_DESTINATION))
      print("Build done in " + destination)
    `
    .split('\n')
    .map((it) => it.trim())
    .filter((it) => it !== '')
    .join(';');
};
