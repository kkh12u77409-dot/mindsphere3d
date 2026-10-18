package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun testAppNameResource() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("MindSphere 3D", appName)
  }

  @Test
  fun testAndroidBridgeSaveAndLoad() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val bridge = AndroidBridge(context)

    val sampleSaveJson = """{"highestUnlocked":5,"totalStars":12}"""
    bridge.saveData(sampleSaveJson)

    val loaded = bridge.loadData()
    assertEquals(sampleSaveJson, loaded)
    assertTrue(bridge.isNativeApp())
  }
}
