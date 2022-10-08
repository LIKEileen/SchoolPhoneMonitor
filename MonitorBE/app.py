from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT
import uuid
import requests


app = Flask(__name__)
# 设置可以跨域访问
CORS(app, supports_credentials=True)
# key是邮箱，value是token
email_tokens = {}

# 数据库
# mysql+pymysql://用户名:密码@IP地址:端口号/数据库名
db_uri = 'mysql+pymysql://{}:{}@{}:{}/{}'.format('root', '123456', '127.0.0.1', 3306, 'yinhang')
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# 创建数据库实例
db = SQLAlchemy(app)


# 定义数据模型
class AlarmEvent(db.Model):
    '''
    创建事件表！
    表名称为alarm_event
    表的列属性：
    id列：Integer型数据，设置为主键且自动递增
    image列：LONGTEXT型数据，用于储存图像的base64编码
    create_time列：DataTime型数据，存储图片生成的时间
    result列：Text型数据，存储算法端反馈的结果
    '''
    __tablename__ = 'alarm_event'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    image = db.Column(LONGTEXT)
    create_time = db.Column(db.DateTime, server_default=db.text('CURRENT_TIMESTAMP'))
    result = db.Column(db.Text)

class RegistData(db.Model):
    '''
    创建用户信息表！
    表名称为regist_data
    表的列属性：
    Email列：VARCHAR型数据，设置为主键，存储用户的电子邮箱
    psword列：VARCHAR型数据，存储用户的密码
    name列：VAECHAR型数据，存储用户名，且不允许重复
    phone列：VARCHAR型数据，存储用户的电话号码
    '''
    __tablename__ = 'regist_data'
    Email = db.Column(db.VARCHAR, primary_key=True)
    psword = db.Column(db.VARCHAR)
    name = db.Column(db.VARCHAR, unique=True)
    phone = db.Column(db.VARCHAR)


# 关联表信息
db.create_all()


# 登录接口
@app.route('/login', methods=['POST'])
def login():
    # 获取客户端发送的用户名、密码参数
    Email = request.json.get('E-mail')
    password = request.json.get('password')
    data = db.session.query(RegistData).get(Email)

    if data is None:
        return {
            'code': 4000,
            'msg': '邮箱未注册！'
        }
    if data.psword != password:
        return {
            'code': 4001,
            'msg': '邮箱或密码错误'
        }

    # 使用uuid作为token
    token = str(uuid.uuid1())
    email_tokens[Email] = token
    return {
        'code': 0,
        'msg': '登录成功',
        'data': {
            'token': token
        }
    }


# 退出登录接口
@app.route('/logout', methods=['POST'])
def logout():
    if not email_tokens:
        return {
            'code': 0,
            'msg': '退出登录成功'
        }

    # 从请求头中获取用户的token信息
    token = request.headers.get('Token')
    # 根据token找到用户名
    email = ''
    for key, value in email_tokens.items():
        if value == token:
            email = key
            break
    # 删除token
    del email_tokens[email]
    return {
        'code': 0,
        'msg': '退出登录成功'
    }


# 注册接口
@app.route('/regist', methods=['POST'])
def regist():
    # 获取客户端发送的注册信息
    Email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('nickname')
    phone = request.json.get('phone')

    #确认邮箱是否已注册以及用户名是否重复
    data1 = db.session.query(RegistData).get(Email)
    data2 = db.session.query(RegistData).filter(RegistData.name == name).first()
    if data1 is not None:
        return{
            'code': 3000,
            'msg': '邮箱已注册！'
        }
    if data2 is not None:
        return{
            'code': 3000,
            'msg': '用户名已注册！'
        }

    #将新注册用户数据添加到数据库中
    reg = RegistData(Email=Email, psword=password, name=name, phone=phone)
    db.session.add(reg)
    db.session.commit()
    return{
        'code': 0,
        'msg': '注册成功！'
    }


# 查询所有的事件数据
@app.route('/event')
def event():
    # 从请求头中获取用户的token信息
    token = request.headers.get('Token')
    exists = False
    for key, value in email_tokens.items():
        if value == token:
            exists = True
            break

    # token不存在
    if not exists:
        return {
            'code': 4002,
            'msg': 'Token无效'
        }

    # 查询数据库
    data = db.session.query(AlarmEvent).order_by(AlarmEvent.id.desc()).all()
    new_data = []
    for evt in data:
        new_data.append({
            'id': evt.id,
            'image': evt.image,
            'create_time': str(evt.create_time),
            'result': evt.result
        })

    return {
        'code': 0,
        'data': new_data
    }


# 接收客户端发送的图片数据，进行图像解析
@app.route('/test', methods=['POST'])
def test():
    # 从请求头中获取用户的token信息
    token = request.headers.get('Token')
    exists = False
    for key, value in email_tokens.items():
        if value == token:
            exists = True
            break

    # token不存在
    if not exists:
        return {
            'code': 4002,
            'msg': 'Token无效'
        }

    # token存在
    # 获取客户端发送的图片数据
    image_base64 = request.json.get('image')
    # 去掉base64头部：data:image/jpeg;base64,
    new_image_base64 = image_base64[image_base64.find(',') + 1:]

    resp = requests.post('https://aip.baidubce.com/oauth/2.0/token', {
        'grant_type': 'client_credentials',
        'client_id': '250RaGg86aP3nqp1Z34y4LDb',
        'client_secret': 'HGd1z12YOtWGuSsBDTBjaCNOEs40ThVz'
    })
    '''   
    获取access_token!
    url地址:https://aip.baidubce.com/oauth/2.0/token
    grant_type：固定值client_credentials
    client_id:为百度智能云开发平台创建的应用的API key
    client_secret：为百度智能云开发平台创建的应用的Secret Key
    '''

    url_params = '?access_token=' + resp.json()['access_token']
    resp = requests.post('https://aip.baidubce.com/rpc/2.0/ai_custom/v1/detection/phone_1108' + url_params, json={
        'image': new_image_base64
    })
    '''    
    调用算法接口!
    算法服务url：https://aip.baidubce.com/rpc/2.0/ai_custom/v1/detection/phone_1108
    url后需要跟参数：获取的access_token
    image：图片数据
    如果需要检测网络数据则将image改为url：图片的路径（并且需要增加一个url参数input_type=url）
    '''

    # 算法的识别结果
    json = resp.json()
    results = json['results']
    if results:  # 有识别到手机
        # 添加数据到数据库
        results = str(results)
        evt = AlarmEvent(image=image_base64, result=results)
        db.session.add(evt)
        db.session.commit()
        return {
            'code': 0,
            'data': results
        }
    else:  # 没有识别到手机直接反馈信息不存储数据
        return {
            'code': 0,
            'msg': '没有识别到手机'
        }


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
