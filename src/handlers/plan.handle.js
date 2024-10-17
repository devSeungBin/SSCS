const db = require('../models/index.db');
const { Groups, Plans, Submissions, Votes } = db;

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
            const now = new Date();
            const dateNow = new Date(now.getTime() + timeDiff);
            const dateTime = dateNow.getTime();

            for (let group of groupList) {
                // 나중에 약속 개수도 group db에 포함시키면 약속 정보를 가져오는 쿼리를 없앨 수 있음
                const submitPlanList = await Plans.findAll({ where: { group_id: group.id, status: 'submit' } , raw: true });
                const votePlanList = await Plans.findAll({ where: { group_id: group.id, status: 'vote' } , raw: true });

                if (submitPlanList.length !== 0) {
                    for (let plan of submitPlanList) {
                        const submissionList = await Submissions.findAll({ where: { plan_id: plan.id } , raw: true });
    
                        if (plan.maximum_user_count) {
                            if (plan.maximum_user_count === submissionList.length) {
                                const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });
                                await newPlan.update({ status: 'calculate' });
                                await newPlan.save();
                                continue;
                            };
                        };
    
                        const planDate = new Date(plan.schedule_deadline);
                        const schedule_deadline = new Date(planDate.getTime() + timeDiff);
                        const schedule_deadline_time = schedule_deadline.getTime();
    
                        if (dateTime >= schedule_deadline_time) {
                            const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });
                            await newPlan.update({ status: 'calculate' });
                            await newPlan.save();
                            continue;
                        };
                    };
                };

                if (votePlanList.length !== 0) {
                    for (let plan of votePlanList) {
                        const voteList = await Votes.findAll({ where: { plan_id: plan.id } , raw: true });
    
                        if (plan.maximum_user_count) {
                            if (plan.maximum_user_count === voteList.length) {
                                const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });

                                let candidate_plan_time = [];
                                for (let time of plan.vote_plan_time) {
                                    if (time.approval.length >= plan.minimum_user_count) {
                                        candidate_plan_time.push({
                                            start: time.start,
                                            end: time.end,
                                            day: time.dat,
                                            time: time.time,
                                            user: time.approval
                                        });
                                    };
                                };

                                if (candidate_plan_time.length === 0) {
                                    if (voteList.length > 0) {
                                        for (let vote of voteList) {
                                            const user = await Votes.findOne({ where: { id: vote.id }, raw: false });
                                            await user.destroy();
                                        };
                                    };

                                    await newPlan.update({ vote_plan_time: null, vote_deadline: null, status: 'fail' });
                                    await newPlan.save();
                                    continue;
                                };

                                let mostUserCount = 0;
                                for (let candidate of candidate_plan_time) {
                                    if (candidate.user.length > mostUserCount) {
                                        mostUserCount = candidate.user.length;
                                    };
                                };
                    
                                let final_candidates = [];
                                for (let candidate of candidate_plan_time) {
                                    if (candidate.user.length === mostUserCount) {
                                        final_candidates.push(candidate);
                                    };
                                };

                                if (final_candidates.length === 1) {
                                    await newPlan.update({ plan_time: final_candidates[0], candidate_plan_time: final_candidates, status: 'comfirm' });
                                    await newPlan.save();
                                    continue;
                                } else {
                                    await newPlan.update({ candidate_plan_time: final_candidates, status: 'select' });
                                    await newPlan.save();
                                    continue;
                                };
                            };
                        };
    
                        const planDate = new Date(plan.vote_deadline);
                        const vote_deadline = new Date(planDate.getTime() + timeDiff);
                        const vote_deadline_time = vote_deadline.getTime();
    
                        if (dateTime >= vote_deadline_time) {
                            const newPlan = await Plans.findOne({ where: { id: plan.id } , raw: false });
                            
                            let candidate_plan_time = [];
                            for (let time of plan.vote_plan_time) {
                                if (time.approval.length >= plan.minimum_user_count) {
                                    candidate_plan_time.push({
                                        start: time.start,
                                        end: time.end,
                                        day: time.dat,
                                        time: time.time,
                                        user: time.approval
                                    });
                                };
                            };

                            if (candidate_plan_time.length === 0) {
                                if (voteList.length > 0) {
                                    for (let vote of voteList) {
                                        const user = await Votes.findOne({ where: { id: vote.id }, raw: false });
                                        await user.destroy();
                                    };
                                };

                                await newPlan.update({ vote_plan_time: null, vote_deadline: null, status: 'fail' });
                                await newPlan.save();
                                continue;
                            };

                            let mostUserCount = 0;
                            for (let candidate of candidate_plan_time) {
                                if (candidate.user.length > mostUserCount) {
                                    mostUserCount = candidate.user.length;
                                };
                            };
                
                            let final_candidates = [];
                            for (let candidate of candidate_plan_time) {
                                if (candidate.user.length === mostUserCount) {
                                    final_candidates.push(candidate);
                                };
                            };

                            if (final_candidates.length === 1) {
                                await newPlan.update({ plan_time: final_candidates[0], candidate_plan_time: final_candidates, status: 'comfirm' });
                                await newPlan.save();
                                continue;
                            } else {
                                await newPlan.update({ candidate_plan_time: final_candidates, status: 'select' });
                                await newPlan.save();
                                continue;
                            };
                        };
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