const json2csv = require('json2csv').parse

exports.get = (req, res) => {

    // If need fields to generate dynamically
    //const fields = Object.keys(Author.schema.obj);
    const fields = [
        'enrollId',
        'pic',
        'qrCode',
        'firstName',
        'middleName',
        'lastName',
        'gender',
        'dob',
        'parentage',
        'address',
        'department',
        'semester',
        'section',
        'busStop'
    ]

    const opts = { fields }
    
    const csv = json2csv('', opts)

    res.set('Content-Disposition', 'attachment;filename=students_template.csv')
    res.set('Content-Type', 'application/octet-stream')

    res.send(csv)
}

