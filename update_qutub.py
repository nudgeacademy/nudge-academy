import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_code = """      // ====== THE QUTUB MINAR ======
      var qutubGroup = new THREE.Group();
      qutubGroup.position.set(45, -20, 0); 
      scene.add(qutubGroup);

      var matSandstone = new THREE.MeshBasicMaterial({color:0xd56d40, wireframe:true, transparent:true, opacity:0.35});
      var matSandstoneGlow = new THREE.MeshBasicMaterial({color:0xee8555, wireframe:true, transparent:true, opacity:0.5});
      var matSandstoneDim = new THREE.MeshBasicMaterial({color:0x994220, wireframe:true, transparent:true, opacity:0.15});

      // 1. BASE PLINTH
      var plinthGeo = new THREE.CylinderGeometry(15, 16, 2, 32, 1, true);
      var plinth = new THREE.Mesh(plinthGeo, matSandstoneDim);
      plinth.position.y = 1;
      qutubGroup.add(plinth);

      // 2. STOREYS
      var storeys = [
        {h: 22, rB: 8, rT: 6.2, type: 'mixed', mat: matSandstone},
        {h: 14, rB: 6.2, rT: 4.8, type: 'round', mat: matSandstoneGlow},
        {h: 11, rB: 4.8, rT: 3.8, type: 'angular', mat: matSandstone},
        {h: 7, rB: 3.8, rT: 3.0, type: 'smooth', mat: matMarble},
        {h: 6, rB: 3.0, rT: 2.2, type: 'smooth', mat: matMarbleGlow}
      ];

      var curY = 2; // start above plinth

      storeys.forEach(function(st, idx) {
        var sGroup = new THREE.Group();
        sGroup.position.y = curY;
        
        var coreGeo = new THREE.CylinderGeometry(st.rT, st.rB, st.h, 24, 6, true);
        var core = new THREE.Mesh(coreGeo, st.mat);
        core.position.y = st.h / 2;
        sGroup.add(core);

        var fluteCount = 24;
        for (var f = 0; f < fluteCount; f++) {
          var angle = (f / fluteCount) * Math.PI * 2;
          var fR_B = st.rB + 0.2;
          
          if (st.type === 'mixed') {
             var isRound = f % 2 === 0;
             if (isRound) {
               var flute = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, st.h, 6, 1, true), matSandstoneDim);
               flute.position.set(Math.sin(angle)*fR_B, st.h/2, Math.cos(angle)*fR_B);
               flute.rotation.z = -Math.sin(angle) * ((st.rB - st.rT)/st.h);
               flute.rotation.x = -Math.cos(angle) * ((st.rB - st.rT)/st.h);
               sGroup.add(flute);
             } else {
               var flute = new THREE.Mesh(new THREE.BoxGeometry(0.5, st.h, 0.5), matSandstoneDim);
               flute.position.set(Math.sin(angle)*fR_B, st.h/2, Math.cos(angle)*fR_B);
               flute.rotation.y = angle;
               flute.rotation.z = -Math.sin(angle) * ((st.rB - st.rT)/st.h);
               flute.rotation.x = -Math.cos(angle) * ((st.rB - st.rT)/st.h);
               sGroup.add(flute);
             }
          } else if (st.type === 'round') {
             var flute = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, st.h, 6, 1, true), matSandstoneDim);
             flute.position.set(Math.sin(angle)*fR_B, st.h/2, Math.cos(angle)*fR_B);
             flute.rotation.z = -Math.sin(angle) * ((st.rB - st.rT)/st.h);
             flute.rotation.x = -Math.cos(angle) * ((st.rB - st.rT)/st.h);
             sGroup.add(flute);
          } else if (st.type === 'angular') {
             var flute = new THREE.Mesh(new THREE.BoxGeometry(0.4, st.h, 0.4), matSandstoneDim);
             flute.position.set(Math.sin(angle)*fR_B, st.h/2, Math.cos(angle)*fR_B);
             flute.rotation.y = angle + Math.PI/4;
             flute.rotation.z = -Math.sin(angle) * ((st.rB - st.rT)/st.h);
             flute.rotation.x = -Math.cos(angle) * ((st.rB - st.rT)/st.h);
             sGroup.add(flute);
          }
        }

        var bandCount = Math.floor(st.h / 3);
        for(var b=1; b<bandCount; b++) {
           var bY = (st.h / bandCount) * b;
           var bR = st.rB - ((st.rB - st.rT) * (bY / st.h)) + 0.4;
           var band = new THREE.Mesh(new THREE.TorusGeometry(bR, 0.1, 4, 32), matMarbleDim);
           band.rotation.x = Math.PI/2;
           band.position.y = bY;
           sGroup.add(band);
        }

        qutubGroup.add(sGroup);
        curY += st.h;

        if (idx < 5) {
           var balcGroup = new THREE.Group();
           balcGroup.position.y = curY;

           var corbelCount = 32;
           for(var c=0; c<corbelCount; c++) {
              var cA = (c/corbelCount)*Math.PI*2;
              var corb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 1.2), (idx >= 3) ? matMarbleDim : matSandstoneDim);
              corb.position.set(Math.sin(cA)*(st.rT+0.5), -0.7, Math.cos(cA)*(st.rT+0.5));
              corb.rotation.y = cA;
              corb.rotation.x = -Math.PI/6;
              balcGroup.add(corb);
           }

           var bRad = st.rT + 1.5;
           var balcBase = new THREE.Mesh(new THREE.TorusGeometry(bRad - 0.5, 0.5, 4, 32), (idx >= 3) ? matMarble : matSandstoneGlow);
           balcBase.rotation.x = Math.PI/2;
           balcGroup.add(balcBase);

           var railBase = new THREE.Mesh(new THREE.CylinderGeometry(bRad, bRad, 1.2, 32, 1, true), (idx >= 3) ? matMarbleDim : matSandstone);
           railBase.position.y = 0.6;
           balcGroup.add(railBase);
           
           var railTop = new THREE.Mesh(new THREE.TorusGeometry(bRad, 0.1, 4, 32), matGoldDim);
           railTop.rotation.x = Math.PI/2;
           railTop.position.y = 1.2;
           balcGroup.add(railTop);

           qutubGroup.add(balcGroup);
        }
      });

      // 3. TOP CUPOLA
      var cupGroup = new THREE.Group();
      cupGroup.position.y = curY;
      
      var baseT = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.5, 16, 1, true), matMarble);
      baseT.position.y = 0.25; cupGroup.add(baseT);

      for(var p=0; p<8; p++) {
         var pA = (p/8)*Math.PI*2;
         var pil = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 6), matMarbleGlow);
         pil.position.set(Math.sin(pA)*1.8, 2, Math.cos(pA)*1.8);
         cupGroup.add(pil);
      }
      
      var eave = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.0, 0.5, 16, 1, true), matSandstoneDim);
      eave.position.y = 3.75; cupGroup.add(eave);

      var cupDome = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 12, 0, Math.PI*2, 0, Math.PI*0.55), matMarbleGlow);
      cupDome.position.y = 4.0; cupDome.scale.y = 1.2; cupGroup.add(cupDome);

      var topFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6), matGold);
      topFinial.position.y = 6.5; cupGroup.add(topFinial);

      qutubGroup.add(cupGroup);

      // 4. RUINS & COURTYARD (Alai Darwaza style ruins)
      var ruinsGroup = new THREE.Group();
      
      var rAngles = [Math.PI/4, -Math.PI/3, Math.PI*0.8, -Math.PI*0.7];
      rAngles.forEach(function(ang, i) {
         var rg = new THREE.Group();
         
         var pL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 12, 1.5), matSandstoneDim);
         pL.position.set(-3.5, 6, 0); rg.add(pL);
         
         var pR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 10, 1.5), matSandstoneDim);
         pR.position.set(3.5, 5, 0); rg.add(pR);

         if (i % 2 === 0) {
            var arch = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.4, 6, 16, Math.PI), matSandstoneGlow);
            arch.position.set(0, 10, 0); rg.add(arch);
         }

         var dist = 22 + Math.random()*8;
         rg.position.set(Math.sin(ang)*dist, 0, Math.cos(ang)*dist);
         rg.rotation.y = -ang;
         ruinsGroup.add(rg);
      });

      var ironPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 7.2, 8, 1, true), matSlate);
      ironPillar.position.set(-10, 3.6, 12);
      ruinsGroup.add(ironPillar);
      
      var ironCap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.6, 8), matGoldDim);
      ironCap.position.set(-10, 7.5, 12); ruinsGroup.add(ironCap);

      qutubGroup.add(ruinsGroup);

      // 5. GROUND & ATMOSPHERICS
      var groundGrid = new THREE.GridHelper(250, 120, 0x1a1a2e, 0x0a0a15);
      groundGrid.position.y = -0.5; groundGrid.material.opacity = 0.06; groundGrid.material.transparent = true;
      qutubGroup.add(groundGrid);

      var particleCount = 1200;
      var pPos = new Float32Array(particleCount*3);
      var pVel = new Float32Array(particleCount*3);
      for(var i=0; i<particleCount; i++) {
        pPos[i*3] = (Math.random()-0.5)*250;
        pPos[i*3+1] = Math.random()*80;
        pPos[i*3+2] = (Math.random()-0.5)*250;
        pVel[i*3] = (Math.random()-0.5)*0.015;
        pVel[i*3+1] = (Math.random()-0.5)*0.01;
        pVel[i*3+2] = (Math.random()-0.5)*0.015;
      }
      var pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({color:0xf59e0b, size:0.15, transparent:true, opacity:0.4}));
      qutubGroup.add(particles);

      var starsGeo = new THREE.BufferGeometry();
      var starsPos = new Float32Array(800*3);
      for(var i=0; i<800; i++) {
        starsPos[i*3] = (Math.random()-0.5)*400;
        starsPos[i*3+1] = Math.random()*150 + 20;
        starsPos[i*3+2] = (Math.random()-0.5)*400;
      }
      starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
      var stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({color:0xffffff, size:0.1, transparent:true, opacity:0.6}));
      qutubGroup.add(stars);


      // ====== ANIMATION ======
      var clock = new THREE.Clock();

      function animate(){
        requestAnimationFrame(animate);
        var t = clock.getElapsedTime();

        targetX += (mouseX - targetX) * 0.02;
        targetY += (mouseY - targetY) * 0.02;

        camera.position.x = targetX * 10 + 85; 
        camera.position.y = targetY * 8 + 20;
        camera.position.z = 55 + Math.sin(t * 0.1) * 3;
        
        camera.lookAt(-10, 15, -15); 

        // Gentle global rotation 
        qutubGroup.rotation.y = Math.sin(t * 0.04) * 0.08;

        // Monument breathing / micro-animations
        cupDome.scale.set(1 + Math.sin(t*0.5)*0.003, 1 + Math.sin(t*0.5)*0.004, 1 + Math.sin(t*0.5)*0.003);
        topFinial.position.y = 6.5 + Math.sin(t*0.8)*0.08;

        var dPositions = particles.geometry.attributes.position.array;
        for(var i=0; i<particleCount; i++) {
          dPositions[i*3+1] += pVel[i*3+1];
          if(dPositions[i*3+1] > 80) dPositions[i*3+1] = 0;
          dPositions[i*3] += Math.sin(t*0.2+i)*0.003;
        }
        particles.geometry.attributes.position.needsUpdate = true;"""

pattern = r"      // ====== THE TAJ MAHAL ======.*pool\.material\.opacity = 0\.08 \+ Math\.sin\(t\*1\.5\)\*0\.02;"

new_content = re.sub(pattern, new_code, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Update applied")
