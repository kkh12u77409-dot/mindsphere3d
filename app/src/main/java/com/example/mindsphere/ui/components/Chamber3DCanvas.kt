package com.example.mindsphere.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import com.example.mindsphere.data.model.EnvironmentTheme
import com.example.mindsphere.data.model.LevelDefinition
import com.example.mindsphere.data.model.PuzzlePlayState
import com.example.mindsphere.data.model.PuzzleType
import com.example.mindsphere.ui.theme.*
import kotlin.math.*

data class Point3D(val x: Float, val y: Float, val z: Float)
data class ProjectedPoint(val x: Float, val y: Float, val depth: Float, val visible: Boolean)

@Composable
fun Chamber3DCanvas(
    level: LevelDefinition?,
    puzzleState: PuzzlePlayState?,
    isDoorOpening: Boolean,
    shakeTrigger: Int,
    onResetCameraRequest: Int = 0,
    modifier: Modifier = Modifier,
    onRingClick: ((String) -> Unit)? = null,
    onNodeClick: ((Int) -> Unit)? = null
) {
    // Spherical coordinates
    var theta by remember { mutableFloatStateOf(Math.PI.toFloat() / 4f) }
    var phi by remember { mutableFloatStateOf(Math.PI.toFloat() / 3f) }
    var radius by remember { mutableFloatStateOf(8.5f) }

    // Reset camera when requested
    LaunchedEffect(onResetCameraRequest) {
        if (onResetCameraRequest > 0) {
            theta = Math.PI.toFloat() / 4f
            phi = Math.PI.toFloat() / 3f
            radius = 8.5f
        }
    }

    // Camera shake
    val shakeAnim = remember { Animatable(0f) }
    LaunchedEffect(shakeTrigger) {
        if (shakeTrigger > 0) {
            shakeAnim.animateTo(
                targetValue = 1f,
                animationSpec = keyframes {
                    durationMillis = 400
                    0f at 0
                    -8f at 50
                    8f at 100
                    -6f at 180
                    4f at 260
                    -2f at 330
                    0f at 400
                }
            )
        }
    }

    // Door opening animation
    val doorProgress by animateFloatAsState(
        targetValue = if (isDoorOpening) 1f else 0f,
        animationSpec = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
        label = "door_open"
    )

    // Continuous ambient rotation of particles and holo sphere
    val infiniteTransition = rememberInfiniteTransition(label = "ambient")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )
    val spin by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(18000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spin"
    )

    val transformState = rememberTransformableState { zoomChange, _, _ ->
        radius = (radius / zoomChange).coerceIn(5.0f, 14.0f)
    }

    val envTheme = level?.environment ?: EnvironmentTheme.NEON
    val primaryColor = when (envTheme) {
        EnvironmentTheme.NEON -> AccentCyan
        EnvironmentTheme.CRYSTAL -> AccentViolet
        EnvironmentTheme.QUANTUM -> AccentGold
    }
    val secondaryColor = when (envTheme) {
        EnvironmentTheme.NEON -> AccentBlue
        EnvironmentTheme.CRYSTAL -> Color(0xFFC77DFF)
        EnvironmentTheme.QUANTUM -> AccentGreen
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    theta -= dragAmount.x * 0.007f
                    phi = (phi - dragAmount.y * 0.007f).coerceIn(0.2f, (Math.PI - 0.2f).toFloat())
                }
            }
            .transformable(state = transformState)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cx = size.width / 2f + shakeAnim.value
            val cy = size.height / 2f
            val target = Point3D(0f, 1.2f, 0f)

            // Camera position in Cartesian coordinates
            val camX = target.x + radius * sin(phi) * sin(theta)
            val camY = target.y + radius * cos(phi)
            val camZ = target.z + radius * sin(phi) * cos(theta)

            // Projection helper
            fun project(p: Point3D): ProjectedPoint {
                // Vector from cam to point
                val dx = p.x - camX
                val dy = p.y - camY
                val dz = p.z - camZ

                // Forward vector (from cam to target)
                val fx = target.x - camX
                val fy = target.y - camY
                val fz = target.z - camZ
                val flen = sqrt(fx * fx + fy * fy + fz * fz)
                val fwdX = fx / flen
                val fwdY = fy / flen
                val fwdZ = fz / flen

                // Up vector (approx 0, 1, 0)
                val upX = 0f
                val upY = 1f
                val upZ = 0f

                // Right vector = cross(fwd, up)
                var rx = fwdY * upZ - fwdZ * upY
                var ry = fwdZ * upX - fwdX * upZ
                var rz = fwdX * upY - fwdY * upX
                val rlen = sqrt(rx * rx + ry * ry + rz * rz)
                if (rlen > 0.0001f) {
                    rx /= rlen
                    ry /= rlen
                    rz /= rlen
                }

                // Recalculate true up = cross(right, fwd)
                val trueUpX = ry * fwdZ - rz * fwdY
                val trueUpY = rz * fwdX - rx * fwdZ
                val trueUpZ = rx * fwdY - ry * fwdX

                // Dot product with camera coordinate axes
                val viewX = dx * rx + dy * ry + dz * rz
                val viewY = dx * trueUpX + dy * trueUpY + dz * trueUpZ
                val viewZ = dx * fwdX + dy * fwdY + dz * fwdZ

                if (viewZ <= 0.2f) {
                    return ProjectedPoint(0f, 0f, viewZ, false)
                }

                val fovFactor = (size.height * 0.95f)
                val projX = cx + (viewX / viewZ) * fovFactor
                val projY = cy - (viewY / viewZ) * fovFactor

                return ProjectedPoint(projX, projY, viewZ, true)
            }

            // 1. Draw Space Background Gradient
            drawRect(
                brush = Brush.radialGradient(
                    colors = listOf(BgSecondary, BgPrimary),
                    center = Offset(cx, cy),
                    radius = size.maxDimension * 0.8f
                )
            )

            // 2. Draw Floor Grid
            drawFloorGrid(::project, primaryColor)

            // 3. Draw Chamber Back Wall & Hydraulic Blast Doors
            drawChamberDoors(::project, doorProgress, primaryColor, secondaryColor)

            // 4. Draw Pedestal Stand
            drawPedestal(::project, primaryColor, secondaryColor)

            // 5. Draw 3D Puzzle Mechanics
            if (level != null && puzzleState != null) {
                when (level.type) {
                    PuzzleType.ROTATION -> {
                        drawRotationRings(
                            ::project,
                            level.rings ?: emptyList(),
                            puzzleState.angles,
                            primaryColor,
                            secondaryColor
                        )
                    }
                    PuzzleType.SWITCH_NETWORK -> {
                        drawSwitchNetwork(
                            ::project,
                            level.nodeCount ?: 3,
                            puzzleState.nodes,
                            level.adjacency ?: emptyList(),
                            primaryColor,
                            secondaryColor
                        )
                    }
                    PuzzleType.SEQUENCE, PuzzleType.PATTERN, PuzzleType.LOGIC_DEDUCTION -> {
                        drawHoloEmitter(::project, pulse, spin, primaryColor, secondaryColor)
                    }
                    PuzzleType.GRAND_PUZZLE -> {
                        drawRotationRings(
                            ::project,
                            level.rings ?: emptyList(),
                            puzzleState.angles,
                            primaryColor,
                            secondaryColor
                        )
                        drawHoloEmitter(::project, pulse, spin, AccentGold, AccentViolet)
                    }
                }
            } else {
                drawHoloEmitter(::project, pulse, spin, primaryColor, secondaryColor)
            }

            // 6. Floating Energy Dust Particles in 3D
            drawAmbientParticles(::project, spin, primaryColor)
        }
    }
}

private fun DrawScope.drawFloorGrid(
    project: (Point3D) -> ProjectedPoint,
    themeColor: Color
) {
    val gridSize = 5
    val step = 1.0f
    val y = 0f

    for (i in -gridSize..gridSize) {
        val p1 = project(Point3D(i * step, y, -gridSize * step))
        val p2 = project(Point3D(i * step, y, gridSize * step))
        if (p1.visible && p2.visible) {
            drawLine(
                color = themeColor.copy(alpha = 0.12f),
                start = Offset(p1.x, p1.y),
                end = Offset(p2.x, p2.y),
                strokeWidth = 1.2f
            )
        }

        val q1 = project(Point3D(-gridSize * step, y, i * step))
        val q2 = project(Point3D(gridSize * step, y, i * step))
        if (q1.visible && q2.visible) {
            drawLine(
                color = themeColor.copy(alpha = 0.12f),
                start = Offset(q1.x, q1.y),
                end = Offset(q2.x, q2.y),
                strokeWidth = 1.2f
            )
        }
    }
}

private fun DrawScope.drawChamberDoors(
    project: (Point3D) -> ProjectedPoint,
    doorOpenProgress: Float,
    primaryColor: Color,
    secondaryColor: Color
) {
    val doorZ = -4.5f
    val doorWidth = 2.4f
    val doorHeight = 4.0f
    val slideOffset = doorOpenProgress * 2.2f

    // Portal Light Behind Doors when opening
    if (doorOpenProgress > 0.05f) {
        val p1 = project(Point3D(-doorWidth, 0f, doorZ - 0.2f))
        val p2 = project(Point3D(doorWidth, 0f, doorZ - 0.2f))
        val p3 = project(Point3D(doorWidth, doorHeight, doorZ - 0.2f))
        val p4 = project(Point3D(-doorWidth, doorHeight, doorZ - 0.2f))

        if (p1.visible && p2.visible && p3.visible && p4.visible) {
            val path = Path().apply {
                moveTo(p1.x, p1.y)
                lineTo(p2.x, p2.y)
                lineTo(p3.x, p3.y)
                lineTo(p4.x, p4.y)
                close()
            }
            drawPath(
                path = path,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        primaryColor.copy(alpha = 0.7f * doorOpenProgress),
                        AccentGold.copy(alpha = 0.9f * doorOpenProgress)
                    )
                )
            )
        }
    }

    // Left Door Leaf
    val l1 = project(Point3D(-doorWidth - slideOffset, 0f, doorZ))
    val l2 = project(Point3D(0f - slideOffset, 0f, doorZ))
    val l3 = project(Point3D(0f - slideOffset, doorHeight, doorZ))
    val l4 = project(Point3D(-doorWidth - slideOffset, doorHeight, doorZ))

    if (l1.visible && l2.visible && l3.visible && l4.visible) {
        val path = Path().apply {
            moveTo(l1.x, l1.y)
            lineTo(l2.x, l2.y)
            lineTo(l3.x, l3.y)
            lineTo(l4.x, l4.y)
            close()
        }
        drawPath(path, BgPanelSolid)
        drawPath(path, primaryColor.copy(alpha = 0.5f), style = Stroke(width = 2f))
        drawLine(
            color = primaryColor,
            start = Offset(l2.x, l2.y),
            end = Offset(l3.x, l3.y),
            strokeWidth = 3f
        )
    }

    // Right Door Leaf
    val r1 = project(Point3D(0f + slideOffset, 0f, doorZ))
    val r2 = project(Point3D(doorWidth + slideOffset, 0f, doorZ))
    val r3 = project(Point3D(doorWidth + slideOffset, doorHeight, doorZ))
    val r4 = project(Point3D(0f + slideOffset, doorHeight, doorZ))

    if (r1.visible && r2.visible && r3.visible && r4.visible) {
        val path = Path().apply {
            moveTo(r1.x, r1.y)
            lineTo(r2.x, r2.y)
            lineTo(r3.x, r3.y)
            lineTo(r4.x, r4.y)
            close()
        }
        drawPath(path, BgPanelSolid)
        drawPath(path, secondaryColor.copy(alpha = 0.5f), style = Stroke(width = 2f))
        drawLine(
            color = secondaryColor,
            start = Offset(r1.x, r1.y),
            end = Offset(r4.x, r4.y),
            strokeWidth = 3f
        )
    }
}

private fun DrawScope.drawPedestal(
    project: (Point3D) -> ProjectedPoint,
    primaryColor: Color,
    secondaryColor: Color
) {
    val segments = 8
    val rBottom = 1.3f
    val rTop = 0.9f
    val yBottom = 0f
    val yTop = 0.85f

    val bottomPts = mutableListOf<ProjectedPoint>()
    val topPts = mutableListOf<ProjectedPoint>()

    for (i in 0 until segments) {
        val a = (i.toFloat() / segments) * 2f * Math.PI.toFloat()
        bottomPts.add(project(Point3D(rBottom * cos(a), yBottom, rBottom * sin(a))))
        topPts.add(project(Point3D(rTop * cos(a), yTop, rTop * sin(a))))
    }

    // Pedestal Base Ring
    for (i in 0 until segments) {
        val next = (i + 1) % segments
        val b1 = bottomPts[i]
        val b2 = bottomPts[next]
        val t1 = topPts[i]
        val t2 = topPts[next]

        if (b1.visible && b2.visible && t1.visible && t2.visible) {
            val face = Path().apply {
                moveTo(b1.x, b1.y)
                lineTo(b2.x, b2.y)
                lineTo(t2.x, t2.y)
                lineTo(t1.x, t1.y)
                close()
            }
            drawPath(face, BgSecondary.copy(alpha = 0.85f))
            drawPath(face, primaryColor.copy(alpha = 0.3f), style = Stroke(width = 1.5f))
        }
    }

    // Top Glowing Ring
    for (i in 0 until segments) {
        val next = (i + 1) % segments
        val t1 = topPts[i]
        val t2 = topPts[next]
        if (t1.visible && t2.visible) {
            drawLine(
                color = primaryColor,
                start = Offset(t1.x, t1.y),
                end = Offset(t2.x, t2.y),
                strokeWidth = 2.5f
            )
        }
    }
}

private fun DrawScope.drawRotationRings(
    project: (Point3D) -> ProjectedPoint,
    rings: List<com.example.mindsphere.data.model.RingDefinition>,
    angles: Map<String, Float>,
    primaryColor: Color,
    secondaryColor: Color
) {
    val y = 1.05f
    val baseRadii = listOf(0.7f, 1.15f, 1.6f)

    rings.forEachIndexed { idx, ring ->
        val r = baseRadii.getOrElse(idx) { 0.7f + idx * 0.45f }
        val currentAngleDeg = angles[ring.id] ?: ring.initialAngle
        val angleRad = (currentAngleDeg * Math.PI / 180f).toFloat()

        val steps = 36
        val pts = mutableListOf<ProjectedPoint>()
        for (i in 0..steps) {
            val a = (i.toFloat() / steps) * 2f * Math.PI.toFloat()
            pts.add(project(Point3D(r * cos(a), y, r * sin(a))))
        }

        // Draw Ring Path
        for (i in 0 until steps) {
            val p1 = pts[i]
            val p2 = pts[i + 1]
            if (p1.visible && p2.visible) {
                drawLine(
                    color = if (idx == 0) primaryColor else secondaryColor,
                    start = Offset(p1.x, p1.y),
                    end = Offset(p2.x, p2.y),
                    strokeWidth = 3f
                )
            }
        }

        // Notch Indicator pointing in rotation direction
        val notchX = r * sin(angleRad)
        val notchZ = -r * cos(angleRad)
        val notchProj = project(Point3D(notchX, y + 0.08f, notchZ))
        if (notchProj.visible) {
            drawCircle(
                color = AccentGold,
                radius = 6f,
                center = Offset(notchProj.x, notchProj.y)
            )
            drawCircle(
                color = Color.White,
                radius = 3f,
                center = Offset(notchProj.x, notchProj.y)
            )
        }
    }

    // Target Laser Beam (0° Zenith Emitter north)
    val laserStart = project(Point3D(0f, y, 0f))
    val laserEnd = project(Point3D(0f, y, -2.0f))
    if (laserStart.visible && laserEnd.visible) {
        drawLine(
            color = AccentCyan.copy(alpha = 0.8f),
            start = Offset(laserStart.x, laserStart.y),
            end = Offset(laserEnd.x, laserEnd.y),
            strokeWidth = 2.5f
        )
    }
}

private fun DrawScope.drawSwitchNetwork(
    project: (Point3D) -> ProjectedPoint,
    nodeCount: Int,
    nodes: List<Boolean>,
    adjacency: List<List<Int>>,
    primaryColor: Color,
    secondaryColor: Color
) {
    val y = 1.1f
    val r = 1.15f
    val nodePoints = mutableListOf<Point3D>()
    val projPoints = mutableListOf<ProjectedPoint>()

    for (i in 0 until nodeCount) {
        val a = (i.toFloat() / nodeCount) * 2f * Math.PI.toFloat() - (Math.PI / 2f).toFloat()
        val pt = Point3D(r * cos(a), y, r * sin(a))
        nodePoints.add(pt)
        projPoints.add(project(pt))
    }

    // Draw Adjacency Conduits (Lines between nodes)
    adjacency.forEachIndexed { fromIdx, neighbors ->
        neighbors.forEach { toIdx ->
            if (fromIdx < toIdx && fromIdx < projPoints.size && toIdx < projPoints.size) {
                val p1 = projPoints[fromIdx]
                val p2 = projPoints[toIdx]
                val bothActive = nodes.getOrElse(fromIdx) { false } && nodes.getOrElse(toIdx) { false }
                if (p1.visible && p2.visible) {
                    drawLine(
                        color = if (bothActive) AccentGreen else primaryColor.copy(alpha = 0.35f),
                        start = Offset(p1.x, p1.y),
                        end = Offset(p2.x, p2.y),
                        strokeWidth = if (bothActive) 3f else 1.5f
                    )
                }
            }
        }
    }

    // Draw Switch Node Crystals
    projPoints.forEachIndexed { i, p ->
        if (p.visible) {
            val isActive = nodes.getOrElse(i) { false }
            val glowColor = if (isActive) AccentGreen else primaryColor.copy(alpha = 0.4f)

            // Outer Aura
            drawCircle(
                color = glowColor.copy(alpha = if (isActive) 0.45f else 0.15f),
                radius = if (isActive) 14f else 8f,
                center = Offset(p.x, p.y)
            )
            // Solid Crystal Core
            drawCircle(
                color = if (isActive) AccentGreen else BgPanelSolid,
                radius = 8f,
                center = Offset(p.x, p.y)
            )
            drawCircle(
                color = if (isActive) Color.White else primaryColor,
                radius = 8f,
                center = Offset(p.x, p.y),
                style = Stroke(width = 2f)
            )
        }
    }
}

private fun DrawScope.drawHoloEmitter(
    project: (Point3D) -> ProjectedPoint,
    pulse: Float,
    spin: Float,
    primaryColor: Color,
    secondaryColor: Color
) {
    val center = Point3D(0f, 1.4f, 0f)
    val projCenter = project(center)
    if (!projCenter.visible) return

    val sphereRadius = 24f * pulse

    // Glowing aura
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(primaryColor.copy(alpha = 0.55f), Color.Transparent),
            center = Offset(projCenter.x, projCenter.y),
            radius = sphereRadius * 1.8f
        ),
        radius = sphereRadius * 1.8f,
        center = Offset(projCenter.x, projCenter.y)
    )

    // Holographic Core Sphere
    drawCircle(
        color = BgPanelSolid,
        radius = sphereRadius,
        center = Offset(projCenter.x, projCenter.y)
    )
    drawCircle(
        color = primaryColor,
        radius = sphereRadius,
        center = Offset(projCenter.x, projCenter.y),
        style = Stroke(width = 2f)
    )

    // Spinning Orbiting Ring Around Hologram
    val ringR = 0.65f
    val steps = 24
    val spinRad = (spin * Math.PI / 180f).toFloat()

    val ringPts = mutableListOf<ProjectedPoint>()
    for (i in 0..steps) {
        val a = (i.toFloat() / steps) * 2f * Math.PI.toFloat()
        val x = ringR * cos(a) * cos(spinRad)
        val y = 1.4f + ringR * sin(a) * 0.4f
        val z = ringR * cos(a) * sin(spinRad)
        ringPts.add(project(Point3D(x, y, z)))
    }

    for (i in 0 until steps) {
        val p1 = ringPts[i]
        val p2 = ringPts[i + 1]
        if (p1.visible && p2.visible) {
            drawLine(
                color = secondaryColor.copy(alpha = 0.7f),
                start = Offset(p1.x, p1.y),
                end = Offset(p2.x, p2.y),
                strokeWidth = 2f
            )
        }
    }
}

private fun DrawScope.drawAmbientParticles(
    project: (Point3D) -> ProjectedPoint,
    spin: Float,
    primaryColor: Color
) {
    val particleCount = 20
    val spinRad = (spin * Math.PI / 180f).toFloat()

    for (i in 0 until particleCount) {
        val seed = i * 1.618f
        val r = 1.2f + (seed % 1.5f)
        val angle = seed * 4f + spinRad * (if (i % 2 == 0) 1f else -0.7f)
        val y = 0.5f + (seed % 1.8f)

        val pt = Point3D(r * cos(angle), y, r * sin(angle))
        val proj = project(pt)
        if (proj.visible) {
            drawCircle(
                color = primaryColor.copy(alpha = 0.4f + ((i % 5) * 0.1f)),
                radius = 2.5f,
                center = Offset(proj.x, proj.y)
            )
        }
    }
}
