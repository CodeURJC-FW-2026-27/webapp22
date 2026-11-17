import express from 'express';

const router = express.Router();
export default router;

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/detail', (req, res) => {
    res.render('detail');
});

router.get('/new-element', (req, res) => {
    res.render('new-element');
});
