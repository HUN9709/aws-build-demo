from flask import Flask, request, render_template, redirect, session, url_for, send_file
from jinja2.loaders import FileSystemLoader
from flask_socketio import SocketIO
from zipfile import ZipFile
import os, sys, subprocess
import io, json
import uuid
import time
app = Flask(__name__)
socketio = SocketIO(app)
mnt_path = os.environ.copy()



# def project_clone(dir_name):
#     result = subprocess.run(['git', 'clone', 'https://github.com/HUN9709/electron-builder-nsis-template.git', dir_name], stdout=subprocess.PIPE, cwd='D:\\')
#     print(result.stdout.decode('utf-8'))
#     # subprocess.run(['sudo', 'chown', '-R', 'ubuntu:1001', "./"+dir_name], stdout=subprocess.PIPE, cwd='/mnt/efs/message')
    
def copy(project_path):
    result = subprocess.run(['sudo', 'cp', '-r', '-p', '/home/ubuntu/downloads/template', project_path + '/template'], stdout=subprocess.PIPE)
    

def pre_build(project_path, version, author, display_name, exe_file_path):
    template_path = project_path + '/template'

    # unzip
    with ZipFile(f'{project_path}/{display_name}.zip', 'r') as zip_file:
        zip_file.extractall(f'{template_path}/main') 
    
    package_file = {}
    # edit package.json
    with open(template_path + '/package.json', 'r') as f:
        package_file = json.load(f)
        package_file['version'] = version
        package_file['author'] = author
        package_file['name'] = display_name
        package_file['build']['productName'] = display_name
        
    with open(template_path + '/package.json', 'w', encoding='utf-8') as f:
        json.dump(package_file, f, indent="\t")

    # edit main.js 
    script= ''
    with open(template_path + '/main.js', 'r') as f:
        script  = f.read()
        script = script.replace('#exe_file', exe_file_path)
        print(script)
    with open(template_path + '/main.js', 'w') as f:
        f.write(script)

def build(project_path):
    result = subprocess.run(['sudo','npm', 'run', 'deploy'], cwd=project_path + '/template')


def post_build(project_path, display_name):
    subprocess.run(['sudo', 'mv', f'{project_path}/template/dist/Builded_Setup.exe', f'{project_path}/{display_name}.exe'])
    subprocess.run(['sudo','rm', '-rf', f'{project_path}/template'])
    subprocess.run(['sudo','rm', '-rf', f'{project_path}/{display_name}.zip'])
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('pre-upload')
def upload_config(data):
    file_uuid = uuid.uuid1()
    session['version'] = data['version']
    session['author'] = data['author']
    session['file_path'] = data['file_path']
    session['display_name'] = data['display_name']
    session['file_uuid'] = file_uuid

    project_path = f'/home/ubuntu/downloads/{{{file_uuid}}}'
    os.makedirs(project_path, exist_ok=True)
    socketio.emit('upload')


@socketio.on('message')
def upload(data):
    file_uuid = session['file_uuid']
    display_name = session['display_name']
    project_path = f'/home/ubuntu/downloads/{{{file_uuid}}}'
    with open(project_path + f"/{display_name}.zip", 'ab') as f:
        f.write(data)


@socketio.on('build')
def start_build():
    version = session['version']
    author = session['author']
    display_name = session['display_name']
    file_path = session['file_path']
    file_uuid = session['file_uuid']

    project_path = f'/home/ubuntu/downloads/{{{file_uuid}}}'
    copy(project_path)
    pre_build(project_path, version, author, display_name, file_path)
    build(project_path)
    post_build(project_path, display_name)
    socketio.emit('download', {'file_uuid' : file_uuid, 'display_name' : display_name})

@app.route('/download/<file_uuid>/<display_name>')
def download(file_uuid, display_name):
    project_path = f'/home/ubuntu/downloads/{{{file_uuid}}}'
   
    return send_file(f'/home/ubuntu/{project_path}/{display_name}.exe', download_name=f'{display_name}.exe')
    
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=80, debug=True)
    pass