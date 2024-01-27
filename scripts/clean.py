import shutil
import os

def remove_directory(path):
    if not os.path.isdir('../' + path):
        print(f"{path}{' ' * (14 - len(path))}| Directory doesn't exist")
        return
    shutil.rmtree('../' + path)
    print(f"{path}{' ' * (14 - len(path))}| Successfully removed directory")

def remove_file(path):
    if not os.path.isfile('../' + path):
        print(f"{path}{' ' * (14 - len(path))}| File doesn't exist")
        return
    os.remove('../' + path)
    print(f"{path}{' ' * (14 - len(path))}| Successfully removed file")

remove_directory('assets')
remove_directory('Components')
remove_directory('extra')
remove_file('index.js')
remove_file('metadata.json')
remove_file('utils.js')
