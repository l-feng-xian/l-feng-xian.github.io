<template>
    <div class="load-page" :class="loadingProgressCpt === '100%' ? 'pageOpacity' : ''">
        <div class="load-content">
            <div class="cube-box">
                <div class="cube" :class="loadingProgressCpt === '100%' ? 'cubescale' : ''">
                    <li v-for="(item, i) in cubeFace" :key="i" :style="item.style">{{ loadingProgressCpt }}</li>
                </div>
                <div class="cube-shadow"></div>
            </div>
        </div>
        <div class="start-item" v-for="(item, i) in startList" :key="i" :style="item.style"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, computed} from 'vue';
const props = defineProps(['loadingProgress']);

const loadingProgressCpt = computed(() =>{
    let loadingProgress = parseInt((props.loadingProgress/26 * 100))
    return loadingProgress + '%';
})

const cubeFace = [
    { style: { transform: 'rotateY(90deg) translateZ(100px)' }, text: 0 },
    { style: { transform: 'rotateY(-90deg) translateZ(100px)' }, text: 4 },
    { style: { transform: 'rotateX(90deg) translateZ(100px)' }, text: 0 },
    { style: { transform: 'rotateX(90deg) translateZ(-100px)' }, text: 4 },
    { style: { transform: 'rotateY(180deg) translateZ(100px)' }, text: 4 },
    { style: { transform: 'rotate(0deg) translateZ(100px)' }, text: 4 },
]

const startList = ref([]);
onMounted(() =>{
    let setStartList = []
    for (let i = 0; i < 100; i++) {
        setStartList.push({style: {
            backgroundColor: `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`,
            left: Math.floor(Math.random()*window.innerWidth) + 'px',
            top: Math.floor(Math.random()*window.innerHeight) + 'px',
            width: Math.floor((Math.random() * 10) + 4) + 'px',
            height: Math.floor((Math.random() * 10) + 4) + 'px',
            animationDelay: Math.random().toFixed(2) + 's',
        }})
    }
    startList.value = setStartList
})
</script>

<style scoped>
.load-page {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background-color: #a9a9a9;
    z-index: 99999;
    pointer-events: none;
}

.pageOpacity {
    animation: pageOpacity 2s 1 forwards !important;
}

@keyframes pageOpacity {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

.load-page .load-content {
    position: relative;
    z-index: 10;
}

.load-page .cube-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 500px;
    transform-style: preserve-3d;
    flex-wrap: wrap;
    user-select: none;
}

.load-page .cube-shadow {
    width: 100%;
    height: 40px;
    background-color: var(--text-color);
    margin-top: 40px;
    border-radius: 20px;
    transform: skew(332deg) scale(1.2);
    box-shadow: 0px 0px 100px var(--text-color);
    filter: blur(20px);
}

.load-page .cube-box .cube {
    position: relative;
    width: 200px;
    height: 200px;
    transform-style: preserve-3d;
    transition: 0.3s;
    animation: cubeRun 4s infinite;
}

@keyframes cubeRun {
    25% {
        transform: translateZ(-100px) rotateY(-90deg);
    }

    50% {
        transform: translateZ(-100px) rotateY(-180deg);
    }

    75% {
        transform: translateZ(-100px) rotateX(-90deg);
    }

    85% {
        transform: translateZ(-100px) rotateX(-90deg);
    }
}

.cubescale {
    animation: cubeScale 2s 1 forwards !important;
}

@keyframes cubeScale {
    0% {
        transform: scale(1);
    }
    10% {
        transform: scale(0.5);
    }
    100% {
        transform: scale(15);
    }
}

.load-page .cube li {
    position: absolute;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-size: 70px;
    font-weight: bold;
    background-color: var(--text-color);
    color: var(--box-bgc);
}

.load-page .start-item {
    position: absolute;
    animation: setrtRun 2s infinite;
}

@keyframes setrtRun {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(0.4);
    }
    100% {
        transform: scale(1);
    }
}
</style>