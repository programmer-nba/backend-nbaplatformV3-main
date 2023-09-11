const { Member } = require("../../models/member.model");

module.exports.getMemberTeam = async (req, res) => {

    try {
        const member = await Member.findOne({ tel: req.params.tel });

        if (!member) {
            return res.status(403).send({ message: 'เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของ NBA Platfrom' });
        } else {
            const upline = [member.upline.lv1, member.upline.lv2, member.upline.lv3];
            console.log('upline', upline)
            const validUplines = upline.filter(item => item !== '-');
            const uplineData = [];
            let i = 0;
            for (const item of validUplines) {
                const include = await Member.findOne({ _id: item });
                uplineData.push({
                    iden: include.iden.number,
                    name: include.name,
                    address: {
                        address: include.address,
                        subdistrict: include.subdistrict,
                        district: include.district,
                        province: include.province,
                        postcode: include.postcode
                    },
                    tel: include.tel,
                    level: (i+1)
                });
                i++;
            }

            const owner = {
                iden: member.iden.number,
                name: member.name,
                address: {
                    address: member.address,
                    subdistrict: member.subdistrict,
                    district: member.district,
                    province: member.province,
                    postcode: member.postcode
                },
                tel: member.tel,
                level: 'owner'
            }

            return res.status(200).send({
                message: 'ดึงข้อมูลสำเร็จ',
                data: [
                    owner || null,
                    uplineData[0] || null,
                    uplineData[1] || null,
                    uplineData[2] || null
                ]
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({ message: 'มีบางอย่างผิดพลาด' });
    }
}