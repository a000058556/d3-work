const friends = {
    john:['Apple','Orange','Lemon'],
    marry:['Apple','Orange'],
    ryan:['Apple','Cherry','Peach','Orange']
};


const thisSVG = d3.select('svg');
d3.selectAll('button').on('click',click);

function click(){
    const thisFruitList = friends[this.dataset.name];
    update(thisFruitList);
    
    }

function update(data){
    thisSVG.selectAll('text')
    .data(data, d=>d)

    // 設定enter,update,exit
    .join(
        enter => {
            enter.append('text').text(d=>d)
                 .attr('x',-100)
                 .attr('y',(d,i)=>50+i*30) // 讓資料依序排入並設定上下間距
                 .style('fill','green') // 加入時為綠色
                 .transition().attr('x',30) // 設定動態
        },
        update => {
            update.transition()
                  .style('fill','red').attr('y',(d,i)=>50+i*30) // 更新時為紅色
        },
        exit => {
            exit.transition() // 設定動態
                .attr('x',150).style('fill','yellow') // 移除時為黃色
                .remove()  // 移除
        }
    );
}