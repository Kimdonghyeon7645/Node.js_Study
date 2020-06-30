var express = require('express')
var methodOverride = require('method-override')
// body-parser 를 내장하지 않을 경우, 설치후 불러줘야 된다.
// const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
app.set("view engine", 'ejs')


var db
MongoClient.connect('mongodb://localhost:27017/', {useUnifiedTopology:true}, function(err, client){    
    if(err) return console.log(err)
    db = client.db('schedule')
    // db.collection('todo').insertOne({할일: 'Nodejs 공부하기',  날짜: '5월 19일'})
    app.listen(8000, function(){
        console.log('listen on 8000')
    })
})

// body-parser 를 내장하지 않을 경우의 코드
// app.use(bodyParser.urlencoded({extended : false}))
// app.use(bodyParser.json())
app.use(express.urlencoded({extended : false}))
app.use(express.json())
app.use(methodOverride('_method'))

app.get('/', function(req, res){
//    res.send("Node.js 에 온걸 환영합니다!")
    res.render('index.ejs')
})

app.get('/write', function(req, res){
    res.render('writing.ejs')
})

app.get('/edit/:id', function(req, res){
    db.collection('todo').findOne({_id: parseInt(req.params.id)}, function(err, result){
        console.log(result)
        res.render('edit.ejs', {edit: result})
    })
})

app.get('/list', function(req, res){
    db.collection('todo').find().toArray(function(err, result){
        console.log(result)
        res.render('list.ejs', {lists: result})
    })
})

app.post('/add', function(req, res){
    db.collection('counter').findOne({name: '발행게시물'}, function(err, result){
        console.log('=============\n' + result + '\n=============')
        console.log('=============\n' + result.total + '\n=============')
        db.collection('todo').insertOne({'_id': result.total, '할일': req.body.todo, '날짜': req.body.date})
        db.collection('counter').updateOne({name: '발행게시물'}, {$inc: {total:1}}, function(err, result){
            if(err) return console.log(err)
            console.log(result)
        })
    })
    res.redirect('/list')
    console.log(req.body)
    console.log(req.body.todo)
    console.log(req.body.date)
})

app.delete('/delete', function(req, res){
    console.log(req.body)
    req.body._id = parseInt(req.body._id)
    db.collection('todo').deleteOne({_id : req.body._id}, function(){
        console.log('삭제 끄읏')
    })
    res.send('삭제 완료')
    res.redirect('/list')
})

app.put('/edit/:id', function(req, res){
    db.collection('todo').updateOne({_id: parseInt(req.params.id)}, {$set: {할일: req.body.todo, 날짜: req.body.date}}, function(err, result){
        res.redirect('/list')
    })
})