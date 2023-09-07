
function drawDeCasteljau(points, step){

    let stepsCnt = 1/step;
    let finalPoints = [];

    finalPoints.push({
        ...points[0]
    });

    for(let j = 1; j<1/step; j++){

        let pt_ = ptAtStep(points, step*j );

        finalPoints.push({...pt_});

    }

    finalPoints.push({
        ...points[points.length-1]
    });

    return finalPoints;
}

function makeFinalPoints(controlpoints, fp, step, len,tol){
    
    let ptsReduced = [];
    let stepsOut = [];
	
    let darr = [];

    let ls = 0; 
    let s = step/2;
    let rs = step;

    let prevpt_ = fp[0];
	let i = 0;
	
    ptsReduced.push({...fp[0]})

    while(true){

        let d = Math.sqrt( (prevpt_.x - fp[i+1].x) * (prevpt_.x - fp[i+1].x) + (prevpt_.y - fp[i+1].y) * (prevpt_.y - fp[i+1].y) );
		
        if( d>=len-len*tol && d<=len+len*tol){

            stepsOut.push(step*(i+1));

            ptsReduced.push({
                ...fp[i+1]
            });

            darr.push(d);

            if(i+1==fp.length-1) break;

            ls = (i+1)*step;
            rs = (i+2)*step;
            s = (ls+rs)/2;

            prevpt_ = fp[++i];

            continue;
        }

        if(d<len-len*tol){

            if(i+1==fp.length-1) break;

            rs = (i+2)*step;
            s = (rs+ls)/2;

            i++;
            continue;
        }

        let distReduced = d;
        //let EXIT__ = false;

        while(true){

            let ptl = ptAtStep(controlpoints, (ls+s)/2);
            let ptr = ptAtStep(controlpoints, (s+rs)/2);

            let dl = Math.sqrt((prevpt_.x - ptl.x)*(prevpt_.x - ptl.x) + (prevpt_.y - ptl.y)*(prevpt_.y - ptl.y));
            let dr = Math.sqrt((prevpt_.x - ptr.x)*(prevpt_.x - ptr.x) + (prevpt_.y - ptr.y)*(prevpt_.y - ptr.y));

            //if(dl==dr){
            //    EXIT__ = true;
            //    break;
            //}

            if(Math.abs(len-dl)<Math.abs(len-dr)){
                
                rs = s;
                s = (ls+s)/2;

                distReduced = dl;

                if(distReduced>=len-len*tol && distReduced<=len+len*tol){

                    stepsOut.push(s);
                    ptsReduced.push(ptl);
                    darr.push(dl);
                    prevpt_ = ptl;

                    ls = s;
                    rs = (i+1)*step;
                    s = (rs+ls)/2;

                    break;
                }

            }
            else{

                ls = s;
                s = (s+rs)/2;

                distReduced = dr;

                if(distReduced>=len-len*tol && distReduced<=len+len*tol){
					
                    stepsOut.push(s);
                    ptsReduced.push(ptr);
                    darr.push(dr);
                    prevpt_ = ptr;

                    ls = s;
                    rs = (i+1)*step;
                    s = (rs+ls)/2;

                    break;
                }

            }

        }

        //if(EXIT__){
        //    break;
        //}

    }

    return ptsReduced;
}

function ptAtStep(points, step){

    let workingPoints = points.map((p)=>{
        return {
            ...p
        }
    });

    while(workingPoints.length>1){

        let nextPoints = [];

        for(let i = 0; i<workingPoints.length-1; i++){

            let x = workingPoints[i].x + (workingPoints[i+1].x - workingPoints[i].x)*step;        
            let y = workingPoints[i].y + (workingPoints[i+1].y - workingPoints[i].y)*step;       

            nextPoints.push({
                x,y
            });

        }

        workingPoints = nextPoints;
    }

    return {
        x: workingPoints[0].x,
        y: workingPoints[0].y
    }
}

module.exports = {
	makeFinalPoints,
	drawDeCasteljau
}