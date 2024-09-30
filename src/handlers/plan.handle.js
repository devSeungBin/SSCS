const db = require('../models/index.db');
const { Groups, Plans, Submissions } = db;

exports.updatePlan = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const groupList = await Groups.findAll({ raw: true });
            if (groupList.length === 0) {
                reject({
                    statusCode: 404,
                    comment: '업데이트할 그룹이 없습니다.'
                });
            };

            const timeDiff = 9 * 60 * 60 * 1000;
            for (let group of groupList) {
                // 나중에 약속 개수도 group db에 포함시키면 약속 정보를 가져오는 쿼리를 없앨 수 있음
                const planList = await Plans.findAll({ where: { group_id: group.id, status: 'submit' } , raw: true });
                if (planList.length === 0) {
                    continue;
                };

                const headCount = group.user_count;
                for (let plan of planList) {
                    const submissionList = await Submissions.findAll({ where: { plan_id: plan.id } , raw: true });

                    if (headCount === submissionList.length) {
                        const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });
                        await newPlan.update({ status: 'calculate' });
                        await newPlan.save();
                        continue;
                    };

                    const dateNow = new Date();
                    const planDate = new Date(plan.schedule_deadline);
                    const planTime = planDate.getTime() + (planDate.getTimezoneOffset() * 60 * 1000);
                    const schedule_deadline = new Date(planTime + timeDiff);
                    if (dateNow >= schedule_deadline) {
                        const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });
                        await newPlan.update({ status: 'calculate' });
                        await newPlan.save();
                        continue;
                    };
                };
            };

            resolve({
                statusCode: 200,
            });

        } catch (err) {
            reject({
                statusCode: 500,
                comment: err
            });
        };
    });
}